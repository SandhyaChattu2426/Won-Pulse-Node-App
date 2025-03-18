# Use official Node.js image
FROM --platform=linux/amd64 node:18-alpine  

# Set the working directory
WORKDIR /app

# Install required dependencies for bcrypt and build tools
RUN apk add --no-cache python3 make g++ bash

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies using legacy-peer-deps
RUN npm ci --legacy-peer-deps

# Ensure bcrypt is correctly built
RUN npm rebuild bcrypt --build-from-source

# Copy the application source
COPY . .

# Set proper permissions
RUN chmod -R 777 /app/node_modules

# Expose port 5000 (ensure this matches your app's port)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
