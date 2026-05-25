import joblib

pipeline = joblib.load("models/deployable_pipeline.pkl")

def get_pipeline():
    return pipeline
