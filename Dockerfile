FROM python:3.10-slim

# Install Java
RUN apt-get update && apt-get install -y --no-install-recommends \
    default-jre-headless \
    default-jdk-headless \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first (before copying code)
COPY requirements.txt /app/

# Install to system Python (not venv - venv gets lost with volume mount)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy project code
COPY . /app

# Spark config
ENV SPARK_LOCAL_IP=127.0.0.1
ENV PYTHONUNBUFFERED=1

# Default command
CMD ["python", "-m", "pytest", "ml/tests/test_embedding_preparation.py", "-v"]

