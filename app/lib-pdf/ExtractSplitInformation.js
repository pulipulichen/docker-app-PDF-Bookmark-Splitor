const {AnnotationFactory} = require('annotpdf');
const path = require('path')

module.exports = async function (inputFile) {

  // console.log(AnnotationFactory.loadFile)
  let factory = await AnnotationFactory.loadFile(inputFile)
  let filename = path.basename(inputFile)
  if (filename.indexOf('.') > -1) {
    filename = filename.slice(0, filename.lastIndexOf('.'))
  }
  
  let pages = await factory.getAnnotations()

  let splitInformation = []
  // console.log()
  pages.forEach((annotations, page_number) => {
    annotations.forEach(annotation => {
      // console.log(annotation.length)
      if (annotation.type !== '/FreeText') {
        // console.log(annotation)
        return false
      }

      let contents = annotation.contents.trim()
      // console.log(annotation.contents)

      if (!contents.startsWith('|')) {
				return false
			}

      let sub_filename = contents.slice(1).trim()
      // sub_filename = sub_filename.replace(/[\u{0080}-\u{FFFF}]/gu, " ")
      // sub_filename = sub_filename.replace(/\n/g, ' ')
      sub_filename = sub_filename.replace(/\r/g, ' ')
      // sub_filename = sub_filename.replace(/\t/g, ' ')
      while (sub_filename.indexOf('  ') > -1) {
        sub_filename = sub_filename.replace(/  /g, ' ').trim()
      }
      sub_filename = sub_filename.trim()
			// console.log(page_number, sub_filename)

      splitInformation.push({
        page: (page_number+1),
        filename: sub_filename,
      })
    })
  })

  return splitInformation
}