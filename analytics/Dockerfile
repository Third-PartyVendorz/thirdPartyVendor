FROM python:3.9.23-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1 \
	PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements.txt .

RUN python -m pip install --upgrade pip \
	&& python -m pip install -r requirements.txt gunicorn

COPY . .

EXPOSE 8089

CMD ["gunicorn", "--bind", "0.0.0.0:8089", "--workers", "2", "analytics_api:app"]
