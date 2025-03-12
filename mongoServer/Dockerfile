# Use official Node.js image as base
FROM node:18-alpine

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json package-lock.json./

# Install dependencies with a clean cache
RUN npm install --legacy-peer-deps
RUN npm rebuild bcrypt --build-from-source

# Copy the rest of the application code to the container
COPY . .

# Grant execution permission to node_modules binaries
RUN chmod -R 777 node_modules

# Expose port (ensure this matches the port used by your app)
EXPOSE 5000

# Command to run the React app
CMD ["npm", "start"]  
