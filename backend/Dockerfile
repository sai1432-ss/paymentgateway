FROM node:18-alpine
WORKDIR /app

# Now that context is root, these will be found
COPY package*.json ./
RUN npm install --omit=dev

# Copy the backend folder contents into the container
COPY ./backend . 

EXPOSE 8000
CMD ["node", "server.js"]