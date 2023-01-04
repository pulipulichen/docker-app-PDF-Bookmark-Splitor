const ShellSpawn = require('./app/lib/ShellSpawn')
const GetExistedArgv = require('./app/lib/GetExistedArgv')
const SetDockerComposeYML = require('./app/lib/SetDockerComposeYML')

const path = require('path')
const fs = require('fs')

let main = async function () {
  // 1. 先取得輸入檔案的列表
  let files = GetExistedArgv()

  for (let i = 0; i < files.length; i++) {
    let file = files[i]

    if (file.endsWith('.pdf') === false) {
      continue
    }
    
		let filename = path.basename(file)
		let dirname = path.dirname(file)
		let tempFilename = Math.floor(Math.random() * 100000) + '.pdf'
		
		let tempFilePath = path.resolve(dirname, tempFilename)
		console.log(tempFilePath)
		console.log(path.resolve(dirname, filename.slice(0, -4) + '.txt'))

		fs.renameSync(file, tempFilePath)


    SetDockerComposeYML(tempFilePath)
    await ShellSpawn('docker-compose up')
		fs.renameSync(tempFilePath, file)
		fs.renameSync(path.resolve(dirname, tempFilename.slice(0, -4) + '.txt'), path.resolve(dirname, filename.slice(0, -4) + '.txt'))
  }
}

main()
