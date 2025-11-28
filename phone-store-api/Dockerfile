FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

ENV NODE_ENV=production
EXPOSE 4000

# chạy theo script "start" trong package.json
CMD ["npm", "start"]
