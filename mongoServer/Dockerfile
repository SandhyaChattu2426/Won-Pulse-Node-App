# Use an official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy remaining application files
COPY . .

# Expose the application port
EXPOSE 5004

# Start the application (avoid nodemon in production)
CMD ["node", "app.js"]
