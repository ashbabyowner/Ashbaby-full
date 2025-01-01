# AI Support Application

A comprehensive AI system with multiple integrated capabilities for various tasks including learning, analysis, and content generation.

## Features

- Multiple integrated AI systems
- Centralized service management
- Real-time processing capabilities
- Scalable architecture
- REST API endpoints

## Tech Stack

- FastAPI
- Python 3.9+
- Various AI/ML libraries
- Docker

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-support-app.git
cd ai-support-app
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the application:
```bash
uvicorn backend.main:app --reload
```

The application will be available at http://localhost:8000

## Free Deployment on Render.com

1. Create a free account on [Render.com](https://render.com)

2. Connect your GitHub repository to Render

3. Create a new Web Service:
   - Choose your repository
   - Select "Docker" as the environment
   - The rest will be configured automatically using render.yaml

4. Set up environment variables in Render dashboard:
   - ENVIRONMENT=production
   - Add any API keys or secrets needed

5. Deploy:
   - Render will automatically build and deploy your application
   - You'll get a free URL like: https://your-app-name.onrender.com

## API Documentation

Once deployed, visit `/docs` or `/redoc` for complete API documentation.

## Free Tier Limitations

- Render free tier goes to sleep after 15 minutes of inactivity
- Wakes up automatically on new requests (may take 30 seconds)
- 512 MB RAM limit
- 0.1 CPU limit
- 500 hours/month free usage

## Monitoring

Access basic monitoring through Render dashboard:
- CPU usage
- Memory usage
- Request logs
- Error logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for any purpose.
