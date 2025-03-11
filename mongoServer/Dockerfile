# Use official Node.js image as base
FROM node:18-alpine

# Set working directory in the container
WORKDIR /app

# Install system dependencies for bcrypt
RUN apk add --no-cache python3 g++ make

# Copy package.json and package-lock.json to the container
COPY package*.json package-lock.json./

# Install dependencies with a clean cache
RUN npm install --legacy-peer-deps
RUN npm install -g nodemon  # Ensure nodemon is globally installed
RUN npm rebuild bcrypt --build-from-source || echo "Skipping bcrypt rebuild"

# Copy the rest of the application code to the container
COPY . .

# Expose port (ensure this matches the port used by your app)
EXPOSE 5000

# Command to run the React app
CMD ["npm", "start"]  
