# Use Node.js alpine image
FROM --platform=linux/amd64 node:18-alpine  

# Set working directory
WORKDIR /app

# Add a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Install dependencies for bcrypt
RUN apk add --no-cache python3 make g++ bash

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with proper permissions
RUN npm install --legacy-peer-deps --unsafe-perm

# Rebuild bcrypt with the correct permissions
RUN npm rebuild bcrypt --build-from-source --unsafe-perm

# Copy the application source
COPY . .

# Expose port 5000
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
