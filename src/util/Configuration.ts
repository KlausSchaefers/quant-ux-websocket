import fs from 'fs'
import Logger from './Logger'


class Configuration {

  PORT = 8086;

  VERSION = '1.0.1'

  QUANT_UX_SERVER = ''

  CLEANUP_INTERVAL_IN_MS = 30000

  LOG_LEVEL = 1

  constructor () {
    try {
      let content = fs.readFileSync('./config.json',  'utf8')
      let data = JSON.parse(content)
      if (data.QUX_SERVER) {
        this.QUANT_UX_SERVER = data.QUX_SERVER
      }

      if (data.PORT) {
        this.PORT = data.PORT
      }

      if (data.LOG_LEVEL) {
        this.LOG_LEVEL = data.LOG_LEVEL
      }

    } catch (e) {
      Logger.error('Configuration.constructor() > Cannot parse file', e)
    }
  }

}

export default new Configuration()