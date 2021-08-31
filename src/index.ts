
import "reflect-metadata";
import {createApp, VERSION} from './app'


async function init() {

  let app = await createApp()
  const PORT = 8088;

  app.listen(PORT, () => {
    console.log(`Quant-UX-WebSocket ${VERSION} is running at https://localhost:${PORT}`);
  });
}

init()