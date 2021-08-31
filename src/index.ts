import * as WebSocket from "ws"
import { createServer, ClientRequest } from 'http';
import {URL} from 'url'
import Logger from './util/Logger'

async function init() {
  const PORT = 8086;
  const VERSION = '1.0.0'

  const server = createServer();
  const wss = new WebSocket.Server({ noServer: true });

  wss.on('connection', (ws:any, appId: string, user: any) => {
    console.debug('connection()', appId, user)
    ws.appId = appId
    ws.userId = user.id
    ws.on('message', (msg:any) => {
      console.log(`Received message ${msg} for `+ appId);
      ws.send(`Ack ${msg}` );
      /**
       * Do something with the message? Add a unique time stamp? Can we get somehow a qunique id?
       */

      wss.clients.forEach((client:any) => {
        console.debug(client.appId)
        /**
         * FIXME: Do not send to same client?
         */
        if (client.readyState === WebSocket.OPEN && client.appId === appId) {
          client.send('Other ' + msg);
        }
      });
    });

    ws.on('pong', () => ws.isAlive = true)
  });

  wss.on('close', function close() {
    console.log('disconnected');
  });

  server.on('upgrade', (request:any, socket:any, head) => {

    authenticate(request, (err:string, appId: string, user: any) => {
      if (err) {
        Logger.warn('Cannot autheicate request')
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, appId, user);
      });
    });
  });

  const interval = setInterval(() => {
    Logger.warn('Check Connections')
    wss.clients.forEach( (ws:any) => {
      if (ws.isAlive === false) {
        Logger.warn('Kill connection')
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping(() => {});
    });
  }, 30000)

  server.listen(PORT);



  console.log(`Quant-UX-WebSocket ${VERSION} is running at https://localhost:${PORT}`);

}

function authenticate (request:any, callback:any) {
  let url = new URL(request.url, 'https://example.org/')
  let appId = url.searchParams.get('app')
  let jwt = url.searchParams.get('jwt')
  console.debug('authenticate()', appId)
  if (!appId || !jwt) {
    callback('URL not correct')
    return
  }
  callback(null, appId, {email: 'klaus', id:'das'})
}

function heartbeat(ws:any) {

}

init()