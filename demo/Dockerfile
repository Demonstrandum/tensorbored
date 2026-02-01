# TensorBored Demo - HuggingFace Spaces
#
# This Dockerfile creates a demo instance of TensorBored with pre-generated
# training data showcasing all the new features.
#
# Build and run locally:
#   docker build -t tensorbored-demo .
#   docker run -p 7860:7860 tensorbored-demo
#
# For HuggingFace Spaces, this is deployed automatically.

FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python dependencies
RUN pip install --no-cache-dir \
    tensorboard>=2.15.0 \
    numpy>=1.24.0 \
    pillow>=10.0.0 \
    protobuf>=3.20.0

# Create directory for TensorBored extensions
RUN mkdir -p /usr/local/lib/python3.11/site-packages/tensorboard/plugins/core

# Copy the TensorBored source (profile_writer, color_sampler, etc.)
# These are the new features that make TensorBored special
COPY tensorboard/plugins/core/profile_writer.py /usr/local/lib/python3.11/site-packages/tensorboard/plugins/core/profile_writer.py
COPY tensorboard/plugins/core/color_sampler.py /usr/local/lib/python3.11/site-packages/tensorboard/plugins/core/color_sampler.py
COPY tensorboard/plugins/core/__init__.py /usr/local/lib/python3.11/site-packages/tensorboard/plugins/core/__init__.py

# Copy demo files
COPY demo/generate_demo_data.py /app/generate_demo_data.py
COPY demo/start.sh /app/start.sh

# Make startup script executable
RUN chmod +x /app/start.sh

# Generate demo data at build time for faster startup
RUN python /app/generate_demo_data.py

# HuggingFace Spaces uses port 7860
EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:7860/ || exit 1

# Start TensorBoard
CMD ["/app/start.sh"]
