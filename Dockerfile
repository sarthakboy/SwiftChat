# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY chat-frontend/package*.json ./
RUN npm ci
COPY chat-frontend/ ./
RUN npm run build

# Stage 2: FastAPI with Python
FROM python:3.11-alpine
ENV PYTHONUNBUFFERED=1
RUN apk add --no-cache gcc musl-dev libffi-dev postgresql-dev openssl-dev
WORKDIR /app

# Copy Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend python files
COPY *.py ./

# Copy the built React files from the first stage
COPY --from=frontend-build /app/build ./chat-frontend/build

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]