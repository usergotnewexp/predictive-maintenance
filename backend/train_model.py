import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, precision_score, recall_score
import xgboost as xgb
import joblib
import os

def train():
    print("Loading data...")
    df = pd.read_csv('data/switchgear_data.csv')
    
    # Feature Engineering (Moving Averages to capture trends)
    print("Engineering features...")
    df = df.sort_values(by=['unit_id', 'date'])
    
    # 7-day moving averages
    features = ['contact_resistance', 'temperature', 'total_cycles', 'voltage_stability', 'insulation_resistance']
    for f in features:
        df[f'{f}_ma7'] = df.groupby('unit_id')[f].transform(lambda x: x.rolling(window=7, min_periods=1).mean())
        df[f'{f}_rate'] = df.groupby('unit_id')[f].transform(lambda x: x.diff().fillna(0))
        
    # Drop rows with NA if any
    df = df.dropna()
    
    X = df.drop(columns=['unit_id', 'date', 'failure_risk_90d'])
    y = df['failure_risk_90d']
    
    # We will split based on units rather than random rows to simulate real-world testing (hold-out units)
    # Target: 80 units for training, 20 for validation
    units = df['unit_id'].unique()
    train_units, test_units = train_test_split(units, test_size=0.2, random_state=42)
    
    train_df = df[df['unit_id'].isin(train_units)]
    test_df = df[df['unit_id'].isin(test_units)]
    
    X_train = train_df.drop(columns=['unit_id', 'date', 'failure_risk_90d'])
    y_train = train_df['failure_risk_90d']
    X_test = test_df.drop(columns=['unit_id', 'date', 'failure_risk_90d'])
    y_test = test_df['failure_risk_90d']
    
    print(f"Training set: {X_train.shape[0]} samples. Testing set: {X_test.shape[0]} samples.")
    
    # Train XGBoost Model
    print("Training XGBoost model...")
    model = xgb.XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42, use_label_encoder=False, eval_metric='logloss')
    model.fit(X_train, y_train)
    
    # Evaluation
    preds = model.predict(X_test)
    probs = model.predict_proba(X_test)[:, 1]
    
    precision = precision_score(y_test, preds)
    recall = recall_score(y_test, preds)
    print("\n--- Model Evaluation ---")
    print(classification_report(y_test, preds))
    print(f"Target metrics -> Precision: {precision:.2f} (Target: >0.85), Recall: {recall:.2f} (Target: >0.75)")
    
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/predictive_model.joblib')
    
    # Save the feature columns for the API to use later
    joblib.dump(list(X.columns), 'models/features.joblib')
    
    print("Model saved to models/predictive_model.joblib")

if __name__ == "__main__":
    train()
