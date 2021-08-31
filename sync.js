const fs = require('fs')
const chalk = require('chalk');


let source = '../luisa-ui/dist'
let target = './build/hosting'


console.debug('-------------------------------------------')
console.debug('Start syncing from ', chalk.blue('BITBUCKET') , 'to ', chalk.blueBright('GITHUB'))
console.debug('-------------------------------------------')


let countNew = 0
let countIgnore = 0
let countNothing = 0
let countUpdate = 0

function updateFile (f) {
    if (fs.existsSync(source + f)) {
        if (fs.existsSync(target + f)) {
            let sourceStats = fs.statSync(source + f)
            let targetStats = fs.statSync(target + f)
            if (sourceStats.size != targetStats.size && sourceStats.blocks > 0) {

                if (sourceStats.mtimeMs > targetStats.mtimeMs) {
                    console.debug(chalk.green('Update file: ' +  target + f))
                    fs.copyFileSync(source + f, target + f)
                    countUpdate++
                } else {
                    console.debug(chalk.yellow('Ignore file: ' + target + f))
                    countIgnore++
                }

            } else {
                countNothing++
            }
        } else {
            console.debug(chalk.green('Create new file: ' + target + f))
            fs.copyFileSync(source + f, target + f)
            countNew++
        }
    } else {
        console.debug(chalk.red('File does not exist: ' + source + f))
    }
}
function updateFolder (folder) {
    let files = fs.readdirSync(source + folder)
    files.forEach(f => {
      updateFile(folder + '/' + f)
    })
}





updateFolder('');
updateFolder('/css');
updateFolder('/js');
updateFolder('/img');
updateFolder('/img/icons');
updateFolder('/fonts');

console.debug('-------------------------------------------')
console.debug('Done! Updated: ', chalk.green(countUpdate),  '> New: ', chalk.green(countNew) , ' > Ignore: ', chalk.yellow(countIgnore), ' > Nothing: ', chalk.yellow(countNothing))

