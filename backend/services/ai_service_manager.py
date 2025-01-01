from typing import Dict, List, Optional, Any
from fastapi import HTTPException
from datetime import datetime, timedelta
import asyncio
import logging
from .omniscient_ai import OmniscientAI
from .ultimate_ai import UltimateAI
from .enhanced_education_therapy_ai import EnhancedEducationTherapyAI
from .life_guide_ai import LifeGuideAI
from .creative_ai import CreativeAIService

class AIServiceManager:
    def __init__(self):
        self.setup_logging()
        self.initialize_services()
        self.setup_service_registry()
        
    def setup_logging(self):
        """Setup logging for AI service management."""
        self.logger = logging.getLogger('AIServiceManager')
        self.logger.setLevel(logging.INFO)
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)

    def initialize_services(self):
        """Initialize all AI services."""
        try:
            self.omniscient_ai = OmniscientAI()
            self.ultimate_ai = UltimateAI()
            self.education_therapy_ai = EnhancedEducationTherapyAI()
            self.life_guide_ai = LifeGuideAI()
            self.creative_ai = CreativeAIService()
            self.logger.info("All AI services initialized successfully")
        except Exception as e:
            self.logger.error(f"Error initializing AI services: {str(e)}")
            raise

    def setup_service_registry(self):
        """Setup registry of available services and their capabilities."""
        self.service_registry = {
            'omniscient': {
                'service': self.omniscient_ai,
                'capabilities': [
                    'general_intelligence',
                    'learning',
                    'reasoning',
                    'adaptation'
                ]
            },
            'ultimate': {
                'service': self.ultimate_ai,
                'capabilities': [
                    'specialized_intelligence',
                    'creative_generation',
                    'analytical_processing',
                    'emotional_intelligence'
                ]
            },
            'education_therapy': {
                'service': self.education_therapy_ai,
                'capabilities': [
                    'educational_support',
                    'therapeutic_guidance',
                    'learning_analysis',
                    'behavioral_support'
                ]
            },
            'life_guide': {
                'service': self.life_guide_ai,
                'capabilities': [
                    'personal_guidance',
                    'career_advice',
                    'relationship_support',
                    'life_optimization'
                ]
            },
            'creative': {
                'service': self.creative_ai,
                'capabilities': [
                    'art_generation',
                    'music_creation',
                    'voice_interaction',
                    'creative_assistance'
                ]
            }
        }

    async def process_request(
        self,
        request_type: str,
        context: Dict[str, Any],
        preferences: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Process requests by routing to appropriate services."""
        try:
            # Determine appropriate services based on request type
            services = self._get_relevant_services(request_type)
            
            # Process request through selected services
            results = {}
            for service_name, service_info in services.items():
                service = service_info['service']
                result = await self._execute_service_request(
                    service,
                    request_type,
                    context,
                    preferences
                )
                results[service_name] = result
            
            # Combine and process results
            final_response = self._combine_service_responses(results)
            
            return final_response

        except Exception as e:
            self.logger.error(f"Error processing request: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error processing request: {str(e)}"
            )

    def _get_relevant_services(
        self,
        request_type: str
    ) -> Dict[str, Dict[str, Any]]:
        """Determine which services are relevant for the request type."""
        relevant_services = {}
        
        # Map request types to service capabilities
        capability_mapping = {
            'learning': ['omniscient', 'education_therapy'],
            'creativity': ['creative', 'ultimate'],
            'guidance': ['life_guide', 'education_therapy'],
            'analysis': ['ultimate', 'omniscient'],
            'therapy': ['education_therapy', 'life_guide'],
            'general': ['omniscient', 'ultimate']
        }
        
        # Get relevant services based on request type
        service_names = capability_mapping.get(
            request_type.lower(),
            ['omniscient']  # Default to omniscient if type unknown
        )
        
        for name in service_names:
            if name in self.service_registry:
                relevant_services[name] = self.service_registry[name]
        
        return relevant_services

    async def _execute_service_request(
        self,
        service: Any,
        request_type: str,
        context: Dict[str, Any],
        preferences: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Execute request on a specific service."""
        try:
            if hasattr(service, 'process_request'):
                return await service.process_request(
                    request_type,
                    context,
                    preferences or {}
                )
            else:
                # Fallback to general processing if specific method not available
                return await self._general_request_processing(
                    service,
                    request_type,
                    context,
                    preferences or {}
                )
        except Exception as e:
            self.logger.error(
                f"Error executing service request: {str(e)}"
            )
            return {
                'status': 'error',
                'error': str(e)
            }

    async def _general_request_processing(
        self,
        service: Any,
        request_type: str,
        context: Dict[str, Any],
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """General request processing for services without specific handlers."""
        try:
            # Attempt to use most appropriate method based on request type
            if request_type == 'learning' and hasattr(service, 'learn'):
                return await service.learn(context, preferences)
            elif request_type == 'analysis' and hasattr(service, 'analyze'):
                return await service.analyze(context, preferences)
            elif request_type == 'generation' and hasattr(service, 'generate'):
                return await service.generate(context, preferences)
            else:
                return {
                    'status': 'error',
                    'message': f'No suitable processing method found for {request_type}'
                }
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }

    def _combine_service_responses(
        self,
        results: Dict[str, Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Combine responses from multiple services into a single response."""
        combined_response = {
            'status': 'success',
            'timestamp': datetime.utcnow().isoformat(),
            'results': results,
            'summary': self._generate_response_summary(results)
        }
        
        # Check for any errors in results
        errors = [
            f"{service}: {result['error']}"
            for service, result in results.items()
            if result.get('status') == 'error'
        ]
        
        if errors:
            combined_response['status'] = 'partial_success'
            combined_response['errors'] = errors
            
        return combined_response

    def _generate_response_summary(
        self,
        results: Dict[str, Dict[str, Any]]
    ) -> str:
        """Generate a summary of the combined service responses."""
        successful_services = [
            service
            for service, result in results.items()
            if result.get('status') != 'error'
        ]
        
        if not successful_services:
            return "No services completed successfully"
            
        return f"Successfully processed request through {', '.join(successful_services)}"
