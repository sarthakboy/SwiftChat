FROM python:3.11-alpine
RUN apk add --no-cache gcc musl-dev libffi-dev && apk upgrade --no-cache
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY *.py ./

# Copy the React build to the path your main.py expects
COPY chat-frontend/build /app/chat-frontend/build

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]