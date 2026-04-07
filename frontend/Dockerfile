FROM node:24-alpine as builder

WORKDIR /app

RUN apk update && apk upgrade

ARG VITE_API_BASE_URL
ARG SERVER_NAME
ARG VITE_ENVIRONMENT
ARG VITE_SENTRY_UI_DSN
ARG VITE_APP_VERSION
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_ORG
ARG SENTRY_PROJECT

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV SERVER_NAME=$SERVER_NAME
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT
ENV VITE_SENTRY_UI_DSN=$VITE_SENTRY_UI_DSN
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
ENV SENTRY_ORG=$SENTRY_ORG
ENV SENTRY_PROJECT=$SENTRY_PROJECT


COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN echo "Building with VITE_API_BASE_URL=$VITE_API_BASE_URL" && npm run build

FROM nginx:stable-alpine

RUN apk update && apk upgrade --no-cache

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

EXPOSE 80

CMD sh -c "envsubst '\$VITE_API_BASE_URL \$SERVER_NAME \$PUBLIC_API_URL' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"