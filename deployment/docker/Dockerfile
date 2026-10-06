# Multi-stage build for AVERO Recommendation Engine
FROM python:3.12.8-slim AS builder

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Create wheels for dependencies
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# Final stage
FROM python:3.12.8-slim

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1000 avero && \
    mkdir -p /app /data && \
    chown -R avero:avero /app /data

WORKDIR /app

# Copy wheels from builder
COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .

# Install Python dependencies from wheels
RUN pip install --no-cache /wheels/*

# Copy application code
COPY --chown=avero:avero . .

# Create necessary directories
RUN mkdir -p ml/versioning ml/airflow/dags checkpoints logs && \
    chown -R avero:avero ml checkpoints logs

# Switch to non-root user
USER avero

# Expose ports
EXPOSE 8000 5000 6379

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Default command: Start FastAPI server
CMD ["python", "-m", "uvicorn", "ml.serving.app:app", "--host", "0.0.0.0", "--port", "8000"]