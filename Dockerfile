FROM python:3.10-slim

# Install Java 17 (use available package)
RUN apt-get update && apt-get install -y --no-install-recommends \
    default-jre-headless \
    default-jdk-headless \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy project
COPY . /app

# Create venv and install dependencies
RUN python3 -m venv /app/.venv
RUN /app/.venv/bin/pip install --upgrade pip
RUN /app/.venv/bin/pip install -r requirements.txt

# Spark config
ENV SPARK_LOCAL_IP=127.0.0.1
ENV PYTHONUNBUFFERED=1
ENV PATH=/app/.venv/bin:$PATH

# Default command
CMD ["python", "-m", "pytest"]

