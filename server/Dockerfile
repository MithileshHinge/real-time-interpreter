FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy the rest of the app
COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
