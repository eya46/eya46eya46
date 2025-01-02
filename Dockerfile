FROM node:22-alpine
LABEL authors="eya46"

WORKDIR /app

ENV HOST "0.0.0.0"
ENV WAKATIME_TOKEN ""
ENV HALO_URL ""
ENV HALO_TOKEN ""

RUN npm install -g pnpm
COPY package.json ./
RUN pnpm install

COPY . .
RUN pnpm build


EXPOSE 4321
CMD ["pnpm", "serve"]
