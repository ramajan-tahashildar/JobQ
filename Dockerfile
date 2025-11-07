FROM node:18-alpine

WORKDIR /app

# Copy package files from server directory
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code from server directory
COPY server/ .

# Create logs and tmp directories
RUN mkdir -p logs tmp

# Expose port
EXPOSE 3000

# Default command
CMD ["node", "src/app.js"]

