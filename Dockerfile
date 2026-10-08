FROM node:20-alpine

# Install OpenSSL and libc compatibility required by Prisma on Alpine Linux
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Define build environment variables (DATABASE_URL is required for prisma db push)
ENV PORT=5000 \
    DATABASE_URL="file:./dev.db" \
    JWT_SECRET="cricket-auction-arena-production-secret-2026"

# Copy package descriptors and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies so tsc & ts-node are present)
RUN npm install --include=dev
RUN npx prisma generate

# Copy full application code and compile TypeScript
COPY . .
RUN npm run build

# Initialize SQLite database and seed initial teams & players
RUN npx prisma db push
RUN npx ts-node prisma/seed.ts

# Set runtime environment
ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "dist/server.js"]
