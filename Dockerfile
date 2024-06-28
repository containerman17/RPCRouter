# Builder stage
FROM node:20-bookworm AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="/pnpm:$PATH"
RUN corepack enable

WORKDIR /builder/
COPY ./package.json ./pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
COPY . ./

RUN pnpm run build

# Runner stage
FROM node:20-bookworm-slim AS runner
ENV NODE_ENV=production \
    NODE_PORT=3024 \
    PROCESS_VERSION_MODULES=115

EXPOSE 3024
WORKDIR /app/

ENV NODE_ENV=production

# Copying all necessary files from the builder stage
COPY --from=builder /builder/node_modules/uWebSockets.js/package.json \
    /builder/node_modules/uWebSockets.js/uws_linux_x64_${PROCESS_VERSION_MODULES}.node \
    /builder/node_modules/uWebSockets.js/uws_linux_arm64_${PROCESS_VERSION_MODULES}.node \
    /builder/node_modules/uWebSockets.js/uws.js \
    /app/node_modules/uWebSockets.js/

COPY --from=builder /builder/node_modules/bufferutil /builder/node_modules/bufferutil
COPY --from=builder /builder/dist/bundle.js /app/dist/bundle.js

CMD ["node", "dist/bundle.js"]
