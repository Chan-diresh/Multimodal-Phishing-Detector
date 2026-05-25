import joblib

pipe = joblib.load("deployable_pipeline.pkl")
print(type(pipe))

if isinstance(pipe, dict):
    print(pipe.keys())
else:
    print("Pipeline object, not dict")
