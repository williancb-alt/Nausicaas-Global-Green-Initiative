FROM python:3.13-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:${PATH}"


COPY pyproject.toml setup.py README.md ./
COPY src/ ./src/

RUN uv venv && \
    . .venv/bin/activate && \
    uv pip install --upgrade pip && \
    uv pip install -e .

COPY . .

FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /root/.local/bin/uv /root/.local/bin/uv
ENV PATH="/root/.local/bin:${PATH}"

COPY . /app

COPY --from=builder /app/.venv/lib/python3.13/site-packages /tmp/site-packages

RUN uv venv --clear && \
    . .venv/bin/activate && \
    cp -r /tmp/site-packages/. .venv/lib/python3.13/site-packages/ && \
    uv pip install -e . && \
    uv pip install tox && \
    uv pip install --upgrade pip setuptools wheel

ENV PATH="/app/.venv/bin:${PATH}"

EXPOSE 8080

CMD ["python", "-m", "gunicorn", "--bind", "0.0.0.0:8080", "--workers", "4", "run:app"]