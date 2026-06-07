FROM mcr.microsoft.com/playwright:v1.52.0-noble AS builder

WORKDIR /app

COPY package.json tsconfig.json ./
RUN npm install

COPY src ./src
RUN npm run build

FROM mcr.microsoft.com/playwright:v1.52.0-noble

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

ENV PORT=3100
ENV RECEITA_MOCK=false

EXPOSE 3100

CMD ["node", "dist/index.js"]
