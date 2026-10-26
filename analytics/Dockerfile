FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN python -m pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python -c "from urllib.request import urlretrieve; urlretrieve('https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem', '/app/global-bundle.pem')"

EXPOSE 8089

CMD ["python", "analytics_api.py"]