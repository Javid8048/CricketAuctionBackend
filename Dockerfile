FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

RUN npm run build
RUN npx prisma db push
RUN npx ts-node prisma/seed.ts

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production
ENV DATABASE_URL="file:./dev.db"

CMD ["node", "dist/server.js"]
