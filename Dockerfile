FROM node:22-alpine

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

COPY . .
RUN npm run build


FROM node:22-alpine
LABEL authors="eya46"
WORKDIR /app

ENV HOST "0.0.0.0"
ENV WAKATIME_TOKEN ""
ENV HALO_URL ""
ENV HALO_TOKEN ""

COPY --from=0 /app/dist /app/dist
COPY --from=0 /app/node_modules /app/node_modules

EXPOSE 4321
CMD ["node", "dist/server/entry.mjs"]
