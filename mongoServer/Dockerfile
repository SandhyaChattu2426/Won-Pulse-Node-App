# Use official Node.js image as base
FROM node:18-alpine

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json package-lock.json./

# Install dependencies with a clean cache
RUN npm install --force


# Copy the rest of the application code to the container
COPY . .


# Expose port (ensure this matches the port used by your app)
EXPOSE 5002

# Command to run the React app
CMD ["npm", "start"]  
