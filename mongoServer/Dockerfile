# Use an official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
RUN apk add --no-cache python3 make g++ bash

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies with proper user permissions
RUN npm ci --legacy-peer-deps --unsafe-perm=true

# Copy remaining application files
COPY . .

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
