import * as WebSocket from "ws"
import { createServer, Server } from 'http';
import {URL} from 'url'
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import Logger from './util/Logger'
import Configuration from './util/Configuration'

async function init() {

  Logger.logLevel = Configuration.LOG_LEVEL

  const server = createServer();
  const wss = createWSS()

  initUpgrade(server, wss)
  initCleanUp(wss)

  server.listen(Configuration.PORT);

  Logger.success(`***************************************************************************************************`);
  Logger.success(`*                                                                                                 *`);
  Logger.success(`* Quant-UX-WebSocket ${Configuration.VERSION} is running at https://localhost:${Configuration.PORT} *`);
  Logger.success(`*                                                                                                 *`);
  Logger.success(`***************************************************************************************************`);

}

function createWSS () : WebSocket.Server {
  Logger.success('createWSS() > enter')
  const wss = new WebSocket.Server({ noServer: true });

  wss.on('close', () => {
    Logger.warn('createWSS() > Close connection')
  });

  wss.on('connection', (ws:any, appId: string) => {
    initClient(wss, ws, appId)
  });

  return wss
}

function initClient (wss:WebSocket.Server, ws: any, appId: string) {
  Logger.log(2, 'initClient() > enter', appId)

  /**
   * Set here dome props on the clients to ensure
   * we can forward to the right clients
   */
  let clientId = uuidv4()
  ws.appId = appId
  ws.clientId = clientId
  ws.lastMessage = new Date().getTime()

  /**
   * Delegate messages to handleMessage
   */
  ws.on('message', (msg:any) => {
    handleMessage(wss, ws, appId, clientId, msg)
  });

  /**
   * Handle pongs for heart beat
   */
  ws.on('pong', () => ws.isAlive = true) // chekc if this really works
}

function handleMessage (wss:WebSocket.Server, ws: any, appId: string,clientId: string, msg: any) {
  Logger.log(2, 'handleMessage() > enter')

  try {
    let now = new Date().getTime()

    /**
     * Set the server timestamp as a means of order,
     * so clients can later order messages
     */
    let data = JSON.parse(msg)
    data.ts = now

    /**
     * Acknowlegde the message with the server timestamp and the message id
     */
    ws.send(JSON.stringify({ts: now, id: data.id, type: 'ack'}));

    /**
     * Forward the message to all other clients that are registered for this app
     */
    let reply = JSON.stringify(data)
    wss.clients.forEach((client:any) => {
      // makethis faster by having a dedicated array??? In this case we also need to clean up stuff
      if (client.readyState === WebSocket.OPEN && client.appId === appId && client.clientId !== clientId) {
        client.send(reply);
      }
    });
  } catch (err) {
    Logger.error('handleMessage() > Could not handle message ', msg)
  }

}

function initUpgrade(server: Server, wss:WebSocket.Server) {
  Logger.success('initUpgrade() > enter')
  server.on('upgrade', (request:any, socket:any, head: any) => {
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
}

function initCleanUp(wss:WebSocket.Server) {
  Logger.success('initCleanUp() > enter')
  const interval = setInterval(() => {
    Logger.warn('Check Connections', wss.clients.values.length)
    wss.clients.forEach( (ws:any) => {
      if (ws.isAlive === false) {
        Logger.warn('initCleanUp() > Kill connection')
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping(() => {});
    });
  }, Configuration.CLEANUP_INTERVAL_IN_MS)
}

function authenticate (request:any, callback:any) {
  let url = new URL(request.url, 'https://example.org/')
  let appId = url.searchParams.get('app')
  let jwt = url.searchParams.get('jwt')
  if (!appId || !jwt) {
    Logger.error('authenticate() > Wrong url', url)
    callback('URL not correct')
    return
  }
  /**
   * FIXME: This could be an extra endpoint... so this will take more time
   */
  let quxURl = `${Configuration.QUANT_UX_SERVER}rest/apps/${appId}.json?token=` + jwt
  axios.get(quxURl)
    .then((response) => {
      Logger.log(2, 'authenticate() > Access granted ' + appId)
      callback(null, appId)
    })
    .catch((error) => {
      Logger.warn('authenticate() > User not allowed to access ' + appId)
      callback('User not allowed' + error)
    })
}

/**
 * Start server
 */
init()