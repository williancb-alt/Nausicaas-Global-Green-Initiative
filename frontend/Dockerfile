FROM node:24-alpine as builder

WORKDIR /app

RUN apk update && apk upgrade

ARG VITE_API_BASE_URL
ARG SERVER_NAME
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV SERVER_NAME=$SERVER_NAME


COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:stable-alpine

RUN apk update && apk upgrade --no-cache

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

EXPOSE 80

CMD sh -c "envsubst '\$VITE_API_BASE_URL \SERVER_NAME' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"