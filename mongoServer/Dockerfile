# Use an official Node.js image
FROM node:18-alpine

# Set user to root for installation
USER root

# Install required dependencies
RUN apk add --no-cache python3 make g++ bash

# Create and set working directory
WORKDIR /app

# Switch back to a non-root user (optional for security)
USER node

# Copy and install dependencies
COPY package.json ./
RUN npm install --legacy-peer-deps

# Copy rest of the application
COPY . .

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
