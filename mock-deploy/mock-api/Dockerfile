FROM python:3.12-slim

WORKDIR /app

RUN pip install --no-cache-dir Flask

COPY flask_test.py .

EXPOSE 8080

CMD ["python", "flask_test.py"]