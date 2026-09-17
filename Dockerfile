FROM python:3.12-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends openjdk-17-jdk-headless && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 \
    PYSPARK_PYTHON=/usr/local/bin/python \
    PYSPARK_DRIVER_PYTHON=/usr/local/bin/python \
    SPARK_LOCAL_DIRS=/tmp/spark-local

COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["pytest", "-q", "ml/tests"]

