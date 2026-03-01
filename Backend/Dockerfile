# Backend Dockerfile
FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Remove sensitive config files
RUN rm -f config.env config.production.env config.test.env

EXPOSE 5001

ENV NODE_ENV=production

CMD ["node", "server.js"]


