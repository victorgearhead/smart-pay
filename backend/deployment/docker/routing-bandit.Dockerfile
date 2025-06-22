FROM python:3.10-slim

# 1) System dependencies
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      gcc \
      g++ \
      curl \
      libvowpalwabbit-dev \
 && rm -rf /var/lib/apt/lists/*

# 2) Create and activate virtualenv
ENV VENV_PATH=/opt/venv
RUN python3 -m venv ${VENV_PATH} \
 && ${VENV_PATH}/bin/pip install --upgrade pip

# 3) Copy requirements and install into venv
WORKDIR /opt/app
RUN ${VENV_PATH}/bin/pip install vowpalwabbit flask pandas json

# 4) Copy your model code and serialized model files
COPY ml_models/routing_bandit/ ./ml_models/routing_bandit/
COPY models/ ./models/

# 5) Expose port and healthcheck
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/ping || exit 1

# 6) Set env & entrypoint to use venv
ENV PATH="${VENV_PATH}/bin:${PATH}"
ENV PYTHONUNBUFFERED=1
ENV MODEL_PATH=ml_models/routing_bandit/routing_model.vw

# 7) Run the Flask/VW server
CMD ["python", "ml_models/routing_bandit/vowpal_wabbit_model.py"]
