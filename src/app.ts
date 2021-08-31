import Logger from './util/Logger'
import Configuration from './util/Configuration'

export const VERSION = '1.0.20'

/**
 * This function configures the app. It does not start
 * the server, because it is also used in all the test cases.
 */
export async function createApp () {


  // config logger
  Logger.logLevel = Configuration.logLevel
  Logger.logFile = Configuration.logFile


  return null
}
