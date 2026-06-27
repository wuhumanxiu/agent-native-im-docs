FROM node:24-bookworm-slim AS builder

WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

FROM node:24-bookworm-slim

ENV NODE_ENV=production
ENV PORT=4000
ENV HOSTNAME=0.0.0.0

WORKDIR /app

COPY --from=builder /src/.next/standalone ./
COPY --from=builder /src/.next/static ./.next/static
COPY --from=builder /src/public ./public

EXPOSE 4000

CMD ["node", "server.js"]
