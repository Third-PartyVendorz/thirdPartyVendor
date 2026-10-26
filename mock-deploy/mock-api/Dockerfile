FROM python:3.12-slim

WORKDIR /app

RUN pip install --no-cache-dir Flask psycopg2-binary==2.9.10

COPY flask_test.py .

RUN python -c "from urllib.request import urlretrieve; urlretrieve('https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem', '/app/global-bundle.pem')"

EXPOSE 8080

CMD ["python", "flask_test.py"]