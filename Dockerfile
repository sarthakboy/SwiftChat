# Stage 1: Build React frontend
FROM node:18 AS frontend-build
WORKDIR /app/chat-frontend
COPY chat-frontend/package*.json ./
RUN npm install
COPY chat-frontend/ ./
RUN npm run build

# Stage 2: Build FastAPI backend
FROM python:3.11-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .
COPY auth.py .

# Copy built React frontend into backend
COPY --from=frontend-build /app/chat-frontend/build ./chat-frontend/build

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]