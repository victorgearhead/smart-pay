FROM python:3.10-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      gcc \
      g++ \
      curl \
      libvowpalwabbit-dev \
 && rm -rf /var/lib/apt/lists/*

ENV VENV_PATH=/opt/venv
RUN python3 -m venv ${VENV_PATH} \
 && ${VENV_PATH}/bin/pip install --upgrade pip

WORKDIR /opt/app
RUN ${VENV_PATH}/bin/pip install vowpalwabbit flask pandas json

COPY ml_models/routing_bandit/ ./ml_models/routing_bandit/
COPY models/ ./models/

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/ping || exit 1

ENV PATH="${VENV_PATH}/bin:${PATH}"
ENV PYTHONUNBUFFERED=1
ENV MODEL_PATH=ml_models/routing_bandit/routing_model.vw

CMD ["python", "ml_models/routing_bandit/vowpal_wabbit_model.py"]
