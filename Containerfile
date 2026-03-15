FROM node:22 as builder

WORKDIR /app

ARG VITE_BASE_URL_RGB
ARG VITE_BASE_URL_DATA
ARG PORT
ENV VITE_BASE_URL_RGB=${VITE_BASE_URL_RGB}
ENV VITE_BASE_URL_DATA=${VITE_BASE_URL_DATA}

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine

ARG PORT=80
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN sed -i "s/listen 80/listen ${PORT}/g" /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE ${PORT}
CMD ["nginx", "-g", "daemon off;"]
