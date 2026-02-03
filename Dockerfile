# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:1.25-alpine
# Copy built static files
COPY --from=build /app/build /usr/share/nginx/html
# Nginx config for SPA + health check
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
