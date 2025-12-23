FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_SYSTEM_PYTHON=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev curl \
 && rm -rf /var/lib/apt/lists/*

RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:${PATH}"

COPY . /app

RUN uv pip install --system --upgrade pip
RUN uv pip install --system -e . 

EXPOSE 8080

CMD ["uv", "run", "flask", "--app", "run.py", "run", "--host", "0.0.0.0", "--port", "8080"]