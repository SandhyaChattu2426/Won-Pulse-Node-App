# Use an official Node.js image
FROM node:18-alpine

# Set user to root for installation
USER root

# Set working directory
WORKDIR /app

# Install dependencies
RUN apk add --no-cache python3 make g++ bash

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json /app/

# Change ownership of the app directory to node user
RUN chown -R node:node /app

# Switch to node user
USER node

# Install dependencies
RUN npm install --legacy-peer-deps --unsafe-perm=true

# Copy remaining application files
COPY --chown=node:node . /app/

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
