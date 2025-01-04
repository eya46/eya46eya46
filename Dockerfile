FROM node:lts-alpine

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY . .
RUN npm run build


FROM node:lts-alpine
LABEL authors="eya46"
WORKDIR /app

RUN apk add --no-cache tzdata && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && apk del tzdata

ENV HOST="0.0.0.0"
ENV WAKATIME_TOKEN=""
ENV HALO_URL=""
ENV HALO_TOKEN=""

COPY --from=0 /app/dist /app/dist

EXPOSE 4321
CMD ["node", "dist/server/entry.mjs"]
