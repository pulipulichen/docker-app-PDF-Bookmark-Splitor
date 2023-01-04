const ShellExec = require('./lib/ShellExec')
const GetExistedArgv = require('./lib/GetExistedArgv')

const path = require('path')
const fs = require('fs')

const SplitPDF = require('./lib-pdf/SplitPDF.js')

let main = async function () {
  let files = GetExistedArgv()

  for (let i = 0; i < files.length; i++) {
    let file = files[i]
    if (file.endsWith('.pdf') === false) {
      continue
    }

    let filename = path.basename(file)
		let dirname = path.dirname(file)
    let filenameNoExt = filename
    if (filenameNoExt.endsWith('.pdf')) {
      filenameNoExt = filenameNoExt.slice(0, -4)
    }

		// let cmd = `qpdf --json "${file}" | jq '.objects' | grep -Po 'Title": \\K.*'`
		let cmd = `pdftk "${file}" dump_data_utf8 | grep '^Bookmark'`
		let result = await ShellExec(cmd)
		let titles = []
		let titleData = []
		let lastTitle
		result.split('BookmarkBegin').forEach((part, i) => {
			if (i === 0) {
				return false
			}
			part = part.trim()

			let lines = part.split('\n')

			let title = lines[0]
			title = title.slice(title.indexOf(':')+1).trim()

			while (title.indexOf('  ') > -1) {
				title = title.replace(/  /g, ' ')
			}

			if (!lastTitle) {
				lastTitle = title
			}
			else if (lastTitle === title) {
				return false
			}
			lastTitle = title

			let level = lines[1]
			level = level.slice(level.indexOf(':')+1).trim()
			level = Number(level)

			if (level !== 1) {
				return false
			}

			let page = lines[2]
			page = page.slice(page.indexOf(':')+1).trim()
			page = Number(page)

			let titlePrefix = ""
			for (let i = 1; i < level.length; i++) {
				titlePrefix = titlePrefix + '-'
			}
			if (level > 1) {
				titlePrefix = titlePrefix + ' '
			}

			// titles.push(`${titlePrefix} ${title} (${page})`)
			titleData.push({
				title,
				level,
				page,
				titlePrefix
			})
		})

		let cmdPageNumber = `pdftk "${file}" dump_data_utf8 | grep 'NumberOfPages'`
		let numberOfPages = await ShellExec(cmdPageNumber)
		numberOfPages = numberOfPages.slice(numberOfPages.indexOf(':')+1).trim()
		numberOfPages = Number(numberOfPages)

		for (let i = 0; i < titleData.length; i++) {
			let nextPage
			if (i < titleData.length - 1) {
				nextPage = titleData[i+1].page
			}
			else {
				nextPage = numberOfPages
			}

			titleData[i].pages = (nextPage - titleData[i].page)
			let {title, page} = titleData[i]

			let end = (nextPage - 1)
			if (i === titleData.length - 1) {
				end++
			}
			titleData[i].filename = `${page}-${end}_${title}`
		}

		if (titleData[0].page !== 1) {
			let nextPage = titleData[0].page
			titleData.unshift({
				page: 1,
				filename: `1-${nextPage - 1}_Cover`
			})
		}

		await SplitPDF(file, titleData)
  }
}

main()
