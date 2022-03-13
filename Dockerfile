FROM node:16-alpine

RUN apk --no-cache add git
RUN apk --no-cache add bash

RUN mkdir -p /usr/src/quant-ux-ws

WORKDIR /usr/src/quant-ux-ws

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

ENV TZ=America/Chicago

ENV QUX_SERVER=http://qux-be.quantux.com:8080

RUN git clone https://github.com/KlausSchaefers/quant-ux-websocket.git

RUN cd quant-ux-websocket && npm install && npm run build

RUN cd

# Expose the Web Port
EXPOSE 8086

## Start the server running
CMD [ "node", "quant-ux-ws/build/build/src/qux-websocket-server.js" ]docker