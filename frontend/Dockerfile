# Use Node.js 18 Alpine as base image
# Alpine is a lightweight Linux distribution
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Install dependencies
# Copy package files first to leverage Docker cache
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Expose port for React development server
EXPOSE 3000

# Start the application
# Using npm start for development
CMD ["npm", "start"] 