FROM node:22 as builder

WORKDIR /app

ARG VITE_BASE_URL_RGB
ARG VITE_BASE_URL_DATA
ENV VITE_BASE_URL_RGB=${VITE_BASE_URL_RGB}
ENV VITE_BASE_URL_DATA=${VITE_BASE_URL_DATA}

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
