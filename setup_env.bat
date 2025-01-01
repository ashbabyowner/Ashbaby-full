@echo off
echo Installing Python 3.9...
curl -o python-3.9.13-amd64.exe https://www.python.org/ftp/python/3.9.13/python-3.9.13-amd64.exe
start /wait python-3.9.13-amd64.exe /quiet InstallAllUsers=1 PrependPath=1

echo Creating virtual environment...
python -m venv venv
call venv\Scripts\activate

echo Installing core dependencies...
python -m pip install --upgrade pip
pip install -r requirements-core.txt

echo Setup complete!
pause
