
import chalk from 'chalk'
class Logger {

  logLevel: number = 1

  logFile: string

  log (level: number, msg: string, data: any = '', data2: any = '') {
    if (level < this.logLevel) {
      console.debug(this.format(msg), data, data2)
    }
  }

  success (msg: string, data: any = '', data2: any = '') {
    console.debug(chalk.blueBright(this.format(msg), data, data2))
  }

  error (msg: string, data: any = '', data2: any = '') {
    console.debug(chalk.red(this.format(msg), data, data2))
  }

  warn (msg: string, data: any = '', data2: any = '') {
    console.debug(chalk.yellow(this.format(msg), data, data2))
  }

  format(msg: string) {
    return new Date().toISOString() + '     ' + msg
  }
}

export default new Logger()