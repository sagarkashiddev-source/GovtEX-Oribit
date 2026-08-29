# --- Stage 1: build the React frontend ---
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Stage 2: backend + bundled frontend ---
FROM node:20-slim
WORKDIR /app

# Native build tools for better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY backend/package.json backend/package-lock.json* ./
RUN npm install --omit=dev
COPY backend/ ./

# Bundle the built frontend so the backend can serve it as static files
COPY --from=frontend-build /app/frontend/dist ./public

ENV NODE_ENV=production
EXPOSE 4000

# Seed the database on first boot if it doesn't exist yet, then start the server
CMD ["sh", "-c", "node seed.js; node server.js"]
