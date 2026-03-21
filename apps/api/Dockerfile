FROM node:20-alpine AS base
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages/ packages/
COPY apps/api/ apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm --filter @marketpilot/database db:generate

WORKDIR /app/apps/api
EXPOSE 3001
CMD ["npx", "tsx", "src/index.ts"]
