# ---------- FRONTEND BUILD ----------
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY ./Frontend/package*.json ./
RUN npm install

COPY ./Frontend ./
RUN npm run build


# ---------- BACKEND BUILD ----------
FROM node:20-alpine

WORKDIR /app

COPY ./Backend/package*.json ./
RUN npm install

COPY ./Backend ./

# Copy frontend build
COPY --from=frontend-builder /app/dist /app/public

CMD ["node", "server.js"]