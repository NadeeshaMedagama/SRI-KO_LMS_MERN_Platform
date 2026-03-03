# Frontend Dockerfile
FROM node:25-alpine AS build

WORKDIR /app

# Install dependencies (include devDependencies for build tools: vite, tailwindcss, postcss, etc.)
COPY package*.json ./
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

