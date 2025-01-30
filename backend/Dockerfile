# Use the official Node.js image
FROM node:16

# Set the working directory
WORKDIR /backend

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the backend port (e.g., 5000)
EXPOSE 5000

# Start the backend server using server.js
CMD ["node", "server.js"]
