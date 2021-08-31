
import chalk from 'chalk'
class Logger {

  logLevel: number = 1

  logFile: string

  log (level: number, msg: string, data: any = '', data2: any = '') {
    if (level < this.logLevel) {
      console.debug(msg, data, data2)
    }
  }

  error (msg: string, data: any = '', data2: any = '') {
    console.debug(chalk.red(msg, data, data2))
  }

  warn (msg: string, data: any = '', data2: any = '') {
    console.debug(chalk.yellow(msg, data, data2))
  }
}

export default new Logger()