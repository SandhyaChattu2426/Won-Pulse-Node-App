# Use a lightweight Node.js image
FROM --platform=linux/amd64 node:18-alpine  

# Set working directory
WORKDIR /app

# Install dependencies for bcrypt
RUN apk add --no-cache python3 make g++ bash

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Rebuild bcrypt
RUN npm rebuild bcrypt --build-from-source

# Copy the application source
COPY . .

# Set proper permissions
RUN chmod -R 777 /app/node_modules

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
