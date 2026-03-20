from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import numpy as np
import json

app = FastAPI(title="Predictive Maintenance API")

# Setup CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and data
try:
    model = joblib.load('models/predictive_model.joblib')
    features = joblib.load('models/features.joblib')
    df = pd.read_csv('data/switchgear_data.csv')
    df['date'] = pd.to_datetime(df['date'])
    
    # Re-calculate features so we have the latest state per unit
    df = df.sort_values(by=['unit_id', 'date'])
    for f in ['contact_resistance', 'temperature', 'total_cycles', 'voltage_stability', 'insulation_resistance']:
        df[f'{f}_ma7'] = df.groupby('unit_id')[f].transform(lambda x: x.rolling(window=7, min_periods=1).mean())
        df[f'{f}_rate'] = df.groupby('unit_id')[f].transform(lambda x: x.diff().fillna(0))
        
    df = df.fillna(0) # For first rows

except Exception as e:
    print(f"Warning: Could not load data/model perfectly. {e}")
    model = None
    df = pd.DataFrame()

@app.get("/api/dashboard")
def get_dashboard_summary():
    # Get the latest row for each unit
    latest_df = df.sort_values("date").groupby("unit_id").tail(1).copy()
    
    units_data = []
    total_alerts = 0
    at_risk = 0
    healthy = 0
    
    for _, row in latest_df.iterrows():
        # Predict failure probability
        if model:
            x_input = row[features].to_frame().T.astype(float)
            prob = model.predict_proba(x_input)[0, 1] * 100
        else:
            prob = 0.0
            
        health_score = max(0.0, 100.0 - prob)
        
        status = "Healthy"
        if prob > 70:
            status = "Critical Risk"
            total_alerts += 1
            at_risk += 1
        elif prob > 40:
            status = "Warning"
            at_risk += 1
        else:
            healthy += 1
            
        units_data.append({
            "id": str(row['unit_id']),
            "healthScore": float(round(health_score, 1)),
            "failureProbability": float(round(prob, 1)),
            "status": status,
            "metrics": {
                "resistance": float(round(row['contact_resistance'], 2)),
                "temperature": float(round(row['temperature'], 1)),
                "cycles": int(row['total_cycles']),
                "voltage": float(round(row['voltage_stability'], 1))
            }
        })
        
    return {
        "summary": {
            "totalUnits": len(latest_df),
            "healthyUnits": healthy,
            "atRiskUnits": at_risk,
            "criticalAlerts": total_alerts
        },
        "units": units_data
    }

@app.get("/api/unit/{unit_id}/history")
def get_unit_history(unit_id: str):
    unit_data = df[df['unit_id'] == unit_id].tail(90) # last 90 days
    if unit_data.empty:
        return {"error": "Unit not found"}
        
    history = []
    for _, row in unit_data.iterrows():
        if model:
            x_input = row[features].to_frame().T.astype(float)
            prob = model.predict_proba(x_input)[0, 1] * 100
        else:
            prob = 0.0
            
        history.append({
            "date": str(row['date'].strftime('%Y-%m-%d')),
            "resistance": float(round(row['contact_resistance'], 2)),
            "temperature": float(round(row['temperature'], 2)),
            "health": float(round(100 - prob, 1))
        })
        
    return history
