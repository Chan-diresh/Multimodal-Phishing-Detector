An ML-powered phishing detection system that analyzes URLs, extracts security-related features, and classifies websites as legitimate or phishing with confidence and risk assessment.

## 🚀 Live Application
Link: [Multimodal Phishing Detector](https://multimodal-phishing-detector-git-master-chandireshs-projects.vercel.app/)

## API Documentation
Interactive Swagger documentation:

Link: [Api testing](https://multimodal-phishing-detector-api.onrender.com/docs)

TECH STACK
Frontend
• React.js
• Vite
• JavaScript
• CSS

Backend
• Python
• FastAPI
• REST API

Machine Learning
• Scikit-learn
• XGBoost
• Pandas
• NumPy

Deployment
• Docker
• Render
• Vercel

Development
• Git
• GitHub

Workflow of the application

1. User enters a URL
        ↓
2. React sends request to FastAPI
        ↓
3. Backend extracts URL features
        ↓
4. Features are transformed using StandardScaler
        ↓
5. XGBoost model generates prediction probability
        ↓
6. Classification threshold is applied
        ↓
7. Risk level is calculated
        ↓
8. JSON response returned
        ↓
9. React displays prediction, confidence and risk

## Deployment

### Frontend
The React/Vite frontend is deployed using Vercel.

### Backend
The FastAPI backend is containerized using Docker and deployed on Render.

### Architecture
React/Vercel → FastAPI/Render → XGBoost ML Pipeline
