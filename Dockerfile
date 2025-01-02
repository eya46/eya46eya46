FROM node:22-alpine
LABEL authors="eya46"

WORKDIR /app

ENV HOST "0.0.0.0"
ENV WAKATIME_TOKEN ""
ENV HALO_URL ""
ENV HALO_TOKEN ""

COPY package.json ./
RUN npm install --omit=dev

COPY . .
RUN npm run build
RUN npm cache clean --force

EXPOSE 4321
CMD ["npm", "run", "serve"]
