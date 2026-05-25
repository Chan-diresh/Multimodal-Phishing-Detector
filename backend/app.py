from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI()   # <-- MUST COME FIRST

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -----------------------------
# Load Pipeline
# -----------------------------
pipeline = joblib.load("deployable_pipeline.pkl")

scaler = pipeline["scaler"]
model = pipeline["model"]
FEATURES = pipeline["features"]
# -----------------------------
# Request Schema
# -----------------------------
class URLRequest(BaseModel):
    url: str

# -----------------------------
# Root Route
# -----------------------------
@app.get("/")
def home():
    return {"message": "Phishing Detection API Running"}

# -----------------------------
# Feature Extraction
# -----------------------------
def extract_features(url: str):
    url = url.lower()

    data = {}

    data["URLLength"] = len(url)
    data["IsHTTPS"] = 1 if url.startswith("https") else 0
    data["IsDomainIP"] = 1 if any(c.isdigit() for c in url.split("//")[-1].split("/")[0]) else 0
    data["NoOfSubDomain"] = url.count('.') - 1

    suspicious_words = [
        "login","secure","update","verify","account",
        "paypal","google","facebook","bank","confirm"
    ]

    hit = int(any(w in url for w in suspicious_words))
    data["RequestURL"] = hit
    data["AnchorURL"] = hit
    data["ServerFormHandler"] = hit

    # Fill missing features with 0
    for col in FEATURES:
        if col not in data:
            data[col] = 0

    return pd.DataFrame([data])[FEATURES]

# -----------------------------
# Prediction Endpoint
# -----------------------------
@app.post("/predict")
def predict(req: URLRequest):
    try:
        X = extract_features(req.url)
        X_scaled = scaler.transform(X)

        prob = float(model.predict_proba(X_scaled)[0][1])

        THRESHOLD = 0.45

        phishing = prob >= THRESHOLD

        # ---------- WHITELIST ----------
        WHITELIST = [
            "google.com",
            "youtube.com",
            "facebook.com",
            "amazon.com",
            "microsoft.com",
            "github.com",
            "wikipedia.org"
        ]

        if any(site in req.url.lower() for site in WHITELIST):
            phishing = False

        # ---------- RULE-BASED PHISHING ----------
        rule_phishing = any(word in req.url.lower() for word in [
            "login-",
            "verify-",
            "secure-",
            "update-",
            "account-",
            "paypal",
            "google",
            "facebook",
            "bank"
        ])

        phishing = phishing or rule_phishing

        # ---------- CONFIDENCE ----------
        if phishing:
            confidence = round(max(prob, 0.6) * 100, 2)
        else:
            confidence = round((1 - prob) * 100, 2)

        # ---------- RISK ----------
        if phishing and prob >= 0.7:
            risk = "High Risk"
        elif phishing:
            risk = "Medium Risk"
        else:
            risk = "Low Risk"

        return {
            "prediction": "Phishing" if phishing else "Legitimate",
            "confidence": confidence,
            "risk": risk
        }

    except Exception as e:
        return {"error": str(e)}


@app.get("/")
def home():
    return {"message": "Phishing Detection API Running"}





