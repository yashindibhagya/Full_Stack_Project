# Use official Node.js image as a base image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all the source code into the container
COPY . .

# Expose the port the frontend will run on
EXPOSE 3000

# Command to run the frontend app
CMD ["npm", "start"]
