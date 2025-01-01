from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException
import plaid
from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
import yodlee
from nordigen import NordigenClient
import coinbase
from ..models.portal import Portal, PortalType, PortalStatus, PortalSync, Balance
from ..core.security import encrypt_value, decrypt_value
from ..core.config import settings
import logging

logger = logging.getLogger(__name__)

class PortalIntegrationService:
    def __init__(self, db: Session):
        self.db = db
        self.setup_clients()

    def setup_clients(self):
        """Initialize API clients for different providers."""
        # Plaid setup
        configuration = plaid.Configuration(
            host=plaid.Environment.Development,
            api_key={
                'clientId': settings.PLAID_CLIENT_ID,
                'secret': settings.PLAID_SECRET,
            }
        )
        self.plaid_client = plaid_api.PlaidApi(configuration)

        # Yodlee setup
        self.yodlee_client = yodlee.Client(
            api_key=settings.YODLEE_API_KEY,
            environment='sandbox'
        )

        # Nordigen setup
        self.nordigen_client = NordigenClient(
            secret_id=settings.NORDIGEN_SECRET_ID,
            secret_key=settings.NORDIGEN_SECRET_KEY
        )

        # Coinbase setup
        self.coinbase_client = coinbase.Client(
            api_key=settings.COINBASE_API_KEY,
            api_secret=settings.COINBASE_API_SECRET
        )

    async def create_link_token(self, user_id: int, portal_type: PortalType) -> str:
        """Create a link token for connecting a new portal."""
        try:
            if portal_type in [PortalType.BANK, PortalType.CREDIT_CARD, PortalType.INVESTMENT]:
                # Create Plaid link token
                request = LinkTokenCreateRequest(
                    products=[Products("transactions"), Products("auth")],
                    client_name="AI Support App",
                    country_codes=[CountryCode('US')],
                    language='en',
                    user=LinkTokenCreateRequestUser(
                        client_user_id=str(user_id)
                    )
                )
                response = self.plaid_client.link_token_create(request)
                return response.link_token
            elif portal_type == PortalType.CRYPTO:
                # Generate Coinbase OAuth URL
                return self.coinbase_client.get_authorize_url()
            else:
                raise HTTPException(status_code=400, detail=f"Portal type {portal_type} not supported")
        except Exception as e:
            logger.error(f"Error creating link token: {str(e)}")
            raise HTTPException(status_code=500, detail="Error creating link token")

    async def connect_portal(
        self,
        user_id: int,
        portal_type: PortalType,
        provider_name: str,
        credentials: Dict[str, Any]
    ) -> Portal:
        """Connect a new portal using provided credentials."""
        try:
            # Create new portal record
            portal = Portal(
                user_id=user_id,
                portal_type=portal_type,
                provider_name=provider_name,
                status=PortalStatus.PENDING
            )
            self.db.add(portal)
            self.db.commit()

            # Connect based on portal type
            if portal_type in [PortalType.BANK, PortalType.CREDIT_CARD, PortalType.INVESTMENT]:
                await self._connect_plaid_portal(portal, credentials)
            elif portal_type == PortalType.CRYPTO:
                await self._connect_crypto_portal(portal, credentials)
            elif portal_type == PortalType.EXPENSE_TRACKING:
                await self._connect_expense_portal(portal, credentials)
            else:
                await self._connect_generic_portal(portal, credentials)

            return portal
        except Exception as e:
            logger.error(f"Error connecting portal: {str(e)}")
            if portal:
                portal.status = PortalStatus.ERROR
                portal.error_message = str(e)
                self.db.commit()
            raise HTTPException(status_code=500, detail="Error connecting portal")

    async def sync_portal(self, portal_id: int) -> PortalSync:
        """Sync data from a connected portal."""
        try:
            portal = self.db.query(Portal).filter(Portal.id == portal_id).first()
            if not portal:
                raise HTTPException(status_code=404, detail="Portal not found")

            # Create sync record
            sync = PortalSync(
                portal_id=portal_id,
                sync_type="full",
                start_time=datetime.utcnow(),
                status="in_progress"
            )
            self.db.add(sync)
            self.db.commit()

            try:
                if portal.portal_type in [PortalType.BANK, PortalType.CREDIT_CARD, PortalType.INVESTMENT]:
                    await self._sync_plaid_data(portal, sync)
                elif portal.portal_type == PortalType.CRYPTO:
                    await self._sync_crypto_data(portal, sync)
                else:
                    await self._sync_generic_data(portal, sync)

                sync.status = "success"
                sync.end_time = datetime.utcnow()
            except Exception as e:
                sync.status = "error"
                sync.error_message = str(e)
                sync.end_time = datetime.utcnow()
                raise

            return sync
        except Exception as e:
            logger.error(f"Error syncing portal: {str(e)}")
            raise HTTPException(status_code=500, detail="Error syncing portal")

    async def _connect_plaid_portal(self, portal: Portal, credentials: Dict[str, Any]):
        """Connect to Plaid and store access token."""
        try:
            # Exchange public token for access token
            exchange_response = self.plaid_client.item_public_token_exchange(
                {'public_token': credentials['public_token']}
            )

            # Store encrypted access token
            portal.access_token = encrypt_value(exchange_response.access_token)
            portal.status = PortalStatus.CONNECTED
            portal.metadata = {
                'item_id': exchange_response.item_id,
                'institution_id': credentials.get('institution_id')
            }
            self.db.commit()

            # Initial sync
            await self.sync_portal(portal.id)
        except Exception as e:
            portal.status = PortalStatus.ERROR
            portal.error_message = str(e)
            self.db.commit()
            raise

    async def _connect_crypto_portal(self, portal: Portal, credentials: Dict[str, Any]):
        """Connect to crypto exchange and store credentials."""
        try:
            # Verify API credentials
            client = coinbase.Client(
                api_key=credentials['api_key'],
                api_secret=credentials['api_secret']
            )
            user = client.get_current_user()

            # Store encrypted credentials
            portal.access_token = encrypt_value(credentials['api_key'])
            portal.refresh_token = encrypt_value(credentials['api_secret'])
            portal.status = PortalStatus.CONNECTED
            portal.metadata = {
                'user_id': user.id,
                'exchange': credentials.get('exchange', 'coinbase')
            }
            self.db.commit()

            # Initial sync
            await self.sync_portal(portal.id)
        except Exception as e:
            portal.status = PortalStatus.ERROR
            portal.error_message = str(e)
            self.db.commit()
            raise

    async def _sync_plaid_data(self, portal: Portal, sync: PortalSync):
        """Sync data from Plaid."""
        try:
            access_token = decrypt_value(portal.access_token)
            
            # Get accounts
            accounts_response = self.plaid_client.accounts_get({'access_token': access_token})
            
            # Update balances
            for account in accounts_response.accounts:
                balance = Balance(
                    portal_id=portal.id,
                    balance_type='current',
                    amount=int(account.balances.current * 100),  # Convert to cents
                    currency=account.balances.iso_currency_code or 'USD',
                    metadata={
                        'account_id': account.account_id,
                        'account_name': account.name,
                        'account_type': account.type,
                        'account_subtype': account.subtype
                    }
                )
                self.db.add(balance)

            # Get transactions
            start_date = datetime.now() - timedelta(days=30)
            transactions_response = self.plaid_client.transactions_get(
                {'access_token': access_token, 'start_date': start_date.date(), 'end_date': datetime.now().date()}
            )

            # Process transactions
            sync.records_processed = len(transactions_response.transactions)
            self.db.commit()

        except Exception as e:
            sync.status = "error"
            sync.error_message = str(e)
            raise

    async def _sync_crypto_data(self, portal: Portal, sync: PortalSync):
        """Sync data from crypto exchange."""
        try:
            api_key = decrypt_value(portal.access_token)
            api_secret = decrypt_value(portal.refresh_token)
            
            client = coinbase.Client(api_key=api_key, api_secret=api_secret)
            
            # Get accounts and balances
            accounts = client.get_accounts()
            
            for account in accounts.data:
                balance = Balance(
                    portal_id=portal.id,
                    balance_type='current',
                    amount=int(float(account.balance.amount) * 100),  # Convert to cents
                    currency=account.balance.currency,
                    metadata={
                        'account_id': account.id,
                        'account_name': account.name,
                        'account_type': 'crypto'
                    }
                )
                self.db.add(balance)

            sync.records_processed = len(accounts.data)
            self.db.commit()

        except Exception as e:
            sync.status = "error"
            sync.error_message = str(e)
            raise

    async def disconnect_portal(self, portal_id: int):
        """Disconnect a portal and remove credentials."""
        try:
            portal = self.db.query(Portal).filter(Portal.id == portal_id).first()
            if not portal:
                raise HTTPException(status_code=404, detail="Portal not found")

            # Revoke access based on portal type
            if portal.portal_type in [PortalType.BANK, PortalType.CREDIT_CARD, PortalType.INVESTMENT]:
                access_token = decrypt_value(portal.access_token)
                self.plaid_client.item_remove({'access_token': access_token})
            elif portal.portal_type == PortalType.CRYPTO:
                # Revoke API access if applicable
                pass

            # Update portal status
            portal.status = PortalStatus.DISCONNECTED
            portal.access_token = None
            portal.refresh_token = None
            portal.error_message = None
            self.db.commit()

        except Exception as e:
            logger.error(f"Error disconnecting portal: {str(e)}")
            raise HTTPException(status_code=500, detail="Error disconnecting portal")
