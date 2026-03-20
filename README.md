# 🛠️ Predictive Maintenance System
> **Turning Reactive Repairs into Proactive Insights with Machine Learning.**

[![Python Version](https://img.shields.io/badge/python-3.8%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![Streamlit](https://img.shields.io/badge/Frontend-Streamlit-FF4B4B.svg)](https://streamlit.io/)
[![Docker](https://img.shields.io/badge/Deployment-Docker-2496ED.svg)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Overview
Predictive maintenance is a game-changer for Industry 4.0. This project utilizes machine learning to monitor equipment health in real-time, predicting potential failures before they occur. By analyzing process parameters like temperature, torque, and rotational speed, this system helps industries minimize downtime and maximize operational efficiency.

### 🎯 Key Objectives
* **Binary Classification:** Predict whether a machine will fail or not.
* **Multi-Class Classification:** Identify the *type* of failure (e.g., Power Failure, Tool Wear, Heat Dissipation).
* **Real-time Insights:** Provide an intuitive dashboard for engineers to monitor metrics instantly.

---

## 🚀 System Architecture

The application is built using a modern decoupled architecture:
1. **Frontend:** A sleek **Streamlit** dashboard for user interaction and data visualization.
2. **Backend:** A robust **FastAPI** server that handles model inference and data processing.
3. **ML Engine:** Trained models (XGBoost/Random Forest) capable of high-precision failure detection.
4. **DevOps:** Fully containerized using **Docker** for seamless deployment.

---

## 📊 Features
- [x] **Predictive Modeling:** High-accuracy failure prediction based on synthetic industrial datasets.
- [x] **Exploratory Data Analysis (EDA):** Built-in visualizations for sensor data correlations.
- [x] **Interactive UI:** Input machine parameters manually to get instant risk assessments.
- [x] **API Access:** Integrated FastAPI documentation (Swagger UI) for external integrations.

---

## 💻 Getting Started

### Prerequisites
* Python 3.8+
* Docker (Optional but recommended)

### Installation
1. **Clone the repository:**
   ```bash
   git clone [https://github.com/usergotnewexp/predictive-maintenance.git](https://github.com/usergotnewexp/predictive-maintenance.git)
   cd predictive-maintenance
