const { exec } = require("child_process")
const sleep = require("./sleep.js")

module.exports = async function (cmd, options = {}) {
  if (Array.isArray(cmd)) {
    cmd = cmd.join(' && ')
  }

  let {stderrHandler, errorHandler, retry = -1, verbose = true} = options
  
  if (typeof(stderrHandler) !== 'function') {
    stderrHandler = function (stderr, reject) {
      // if (verbose) {
        console.log(`${stderr}`);
      // }
    }
  }

  if (typeof(errorHandler) !== 'function') {
    errorHandler = function (error, reject) {
      
      console.error(`[ERROR]\n${error.message}`)
      reject(error)
      return
    }
  }

  // let output = ''

  let currentRetry = 0
  let run = async () => {
    return new Promise(function (resolve, reject) {

      exec(cmd , async (error, stdout, stderr) => {
        if (error) {
          if (retry === -1 || currentRetry === retry) {
            return errorHandler(error, reject)
          }
          currentRetry++
          await sleep((retry + 1) * 5 * 1000)
          resolve(await run())
        }
        if (stderr) {
          stderrHandler(stderr);
        }

        if (stdout.trim() !== '') {
          if (verbose) {
            console.log(`${stdout}`)
          }
        }
        
        // resolve(`[STDOUT]\n${stdout}`)
        // resolve(stdout)
        if (verbose) {
          resolve(stdout)
        }
        else {
          resolve('')
        }
      });
    })     
  }

  return await run()
}