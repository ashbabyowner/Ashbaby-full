@echo off
echo Setting up development environment...

:: Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

:: Activate virtual environment
call venv\Scripts\activate

:: Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

:: Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    echo ENVIRONMENT=development > .env
    echo DEBUG=True >> .env
    echo API_HOST=localhost >> .env
    echo API_PORT=8000 >> .env
    echo DATABASE_URL=sqlite:///./app.db >> .env
)

echo Setup complete! You can now:
echo 1. Open VS Code with: code .
echo 2. Select "Python: FastAPI" from the debug menu
echo 3. Press F5 to start debugging
echo.
echo The API will be available at http://localhost:8000
echo API documentation will be at http://localhost:8000/docs
pause
