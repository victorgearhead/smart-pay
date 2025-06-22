
FROM python:3.10-slim

WORKDIR /opt/ml/model

RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ml_models/fraud_detection/ ./
COPY models/ ./models/

ENV PYTHONUNBUFFERED=1
ENV MODEL_PATH=ml_models/fraud_detection/fraud_model.joblib

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f https://localhost:8080/ping || exit 1

CMD ["python", "ml_models/fraud_detection/xgboost_model.py"]
