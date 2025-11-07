FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create logs and tmp directories
RUN mkdir -p logs tmp

# Expose port
EXPOSE 3000

# Default command (can be overridden in docker-compose)
CMD ["node", "src/app.js"]

