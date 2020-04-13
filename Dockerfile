FROM node:13

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN yarn install

COPY . .
RUN yarn build

EXPOSE 8080
CMD [ "node", "server.js" ]
