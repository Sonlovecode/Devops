# Stage 1: build React app
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

# build-time env (Vite)
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE

COPY . .
RUN npm run build

# Stage 2: serve bằng nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
