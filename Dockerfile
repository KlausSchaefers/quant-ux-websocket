FROM node:16-alpine AS builder
USER node
WORKDIR /home/node

COPY --chown=node:node ["package.json", "package-lock.json", "tsconfig.json", "./"]
RUN npm install
COPY --chown=node:node ["src/", "./src/"]
RUN npm run build



FROM node:16-alpine AS deps

USER node
WORKDIR /home/node

COPY --chown=node:node ["package.json", "package-lock.json", "./"]
RUN npm install --omit=dev



FROM node:16-alpine AS runner

USER node
WORKDIR /home/node

COPY --chown=node:node --from=deps ["/home/node/node_modules", "node_modules/"]
COPY --chown=node:node ["config.json", "./"]
COPY --chown=node:node --from=builder ["/home/node/build", "build/"]

CMD [ "node", "build/src/qux-websocket-server.js" ]
