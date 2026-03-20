import pandas as pd
import numpy as np
import datetime
import os

def generate_synthetic_data(num_units=100, days=730):
    np.random.seed(42)
    start_date = datetime.datetime.now() - datetime.timedelta(days=days)
    
    data = []
    
    for unit_id in range(1, num_units + 1):
        # 80% healthy, 20% experience a failure
        will_fail = np.random.rand() < 0.20
        failure_day = np.random.randint(400, days) if will_fail else days + 100
        
        # Baselines
        base_resistance = np.random.uniform(50, 70) # mOhm
        base_temp = np.random.uniform(30, 45) # Celsius
        daily_cycles = np.random.randint(10, 50)
        base_voltage_stability = np.random.uniform(98, 100) # %
        base_insulation = np.random.uniform(500, 1000) # MOhm
        
        total_cycles = np.random.randint(5000, 20000)
        
        for day in range(days):
            current_date = start_date + datetime.timedelta(days=day)
            
            # Normal degradation over time
            resistance = base_resistance + day * 0.01 + np.random.normal(0, 1)
            temp = base_temp + day * 0.005 + np.random.normal(0, 2)
            cycles = total_cycles + day * daily_cycles
            voltage_stab = base_voltage_stability - np.random.normal(0, 0.5)
            insulation = base_insulation - day * 0.1 - np.random.normal(0, 5)
            
            # Accelerated degradation leading up to failure
            days_to_failure = failure_day - day
            
            if will_fail and 0 <= days_to_failure <= 120:
                # Exponential degradation
                degradation_factor = (120 - days_to_failure) ** 1.5
                resistance += degradation_factor * 0.05
                temp += degradation_factor * 0.08
                voltage_stab -= degradation_factor * 0.02
                insulation -= degradation_factor * 0.5
            
            # Target variable (will fail in the next 90 days)
            target = 1 if (will_fail and 0 < days_to_failure <= 90) else 0
            
            # Mark the actual failure day as end of life
            if day == failure_day:
                break
                
            data.append({
                'unit_id': f'SWG-{unit_id:03d}',
                'date': current_date.strftime('%Y-%m-%d'),
                'contact_resistance': max(0, resistance),
                'temperature': max(0, temp),
                'total_cycles': cycles,
                'voltage_stability': min(100, max(0, voltage_stab)),
                'insulation_resistance': max(0, insulation),
                'failure_risk_90d': target
            })
            
    df = pd.DataFrame(data)
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/switchgear_data.csv', index=False)
    print("Synthetic dataset generated: data/switchgear_data.csv")
    print(df['failure_risk_90d'].value_counts())

if __name__ == '__main__':
    generate_synthetic_data()
