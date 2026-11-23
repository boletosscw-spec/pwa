FROM python:3.14-slim

WORKDIR /app
ENV DJANGO_DEBUG=0 PYTHONUNBUFFERED=1
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY config/ config/
COPY accounts/ accounts/
COPY game/ game/
COPY landing/ landing/
COPY news/ news/
COPY manage.py .
RUN python manage.py collectstatic --noinput

CMD ["sh", "-c", "test -n \"$DJANGO_SECRET_KEY\" && python manage.py migrate --noinput && exec gunicorn config.wsgi:application --bind \"0.0.0.0:${PORT:-8000}\" --workers 2"]
