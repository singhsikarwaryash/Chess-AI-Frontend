# ---------- Build stage ----------
FROM node:18-alpine AS build
WORKDIR /app

# Copy sources
COPY package.json ./
COPY . .

# Install deps (ignore strict peer checks for older CRA stacks)
RUN npm install --legacy-peer-deps --no-audit --no-fund \
 && npm install ajv@6.12.6 ajv-keywords@3.5.2 --no-audit --no-fund

# Build static files
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:1.25-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
