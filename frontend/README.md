# PhishGuard AI Frontend

React + Vite frontend for the existing FastAPI phishing detection backend.

## 1. Configure the API

Copy `.env.example` to `.env` and set:

```env
VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com
```

Do not add `/predict` to the value.

## 2. Run locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## 3. Backend contract

This frontend sends exactly:

```json
POST /predict
{
  "url": "https://example.com"
}
```

It expects the existing backend response:

```json
{
  "prediction": "Legitimate",
  "confidence": 100,
  "risk": "Low Risk"
}
```

No backend model or endpoint changes are required.

## 4. Build for production

```bash
npm run build
```

The production output is created in `dist/`.

## 5. Deploy

For Vercel, import this folder/repository, set the environment variable `VITE_API_URL` to your Render backend URL, and use the default Vite build settings.
