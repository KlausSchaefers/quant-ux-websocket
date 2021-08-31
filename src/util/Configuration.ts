import fs from 'fs'
import Logger from './Logger'

class Configuration {

  jwtSecret: string = 'Test'

  jwtExpires: string=  '24h'

  dataPath: string  = './data'

  mailServer: string  = ''

  mailUser: string  = ''

  mailPassword: string  = ''

  mailDebug: boolean = false

  logLevel: number = 1

  logFile: string = ''

  templateFolder: string = 'hosting'


  constructor () {
    try {
      let content = fs.readFileSync('./config.json',  'utf8')
      let data = JSON.parse(content)

      // jwt
      if (data.jwtSecret) {
        this.jwtSecret = data.jwtSecret
      }
      if (data.dataPath) {
        this.dataPath = data.dataPath
      }
      if (data.jwtExpires) {
        this.jwtExpires = data.jwtExpires
      }

      // mail
      if (data.mailServer) {
        this.mailServer = data.mailServer
      }
      if (data.mailUser) {
        this.mailUser = data.mailUser
      }
      if (data.mailPassword) {
        this.mailPassword = data.mailPassword
      }
      if (data.mailDebug !== undefined) {
        this.mailDebug = data.mailDebug
      }

      // log
      if (data.logLevel !== undefined) {
        this.logLevel = data.logLevel
      }
      if (data.logFile !== undefined) {
        this.logFile = data.logFile
      }

      if (data.templateFolder) {
        this.templateFolder = data.templateFolder
      }
    } catch (e) {
      Logger.error('Configuration.constructor() > Cannot parse file')
    }
  }

}

export default new Configuration()