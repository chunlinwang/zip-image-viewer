import AdmZip from 'adm-zip'
import { ExtractedImage } from './interface'

export function extractFiles(filePath: string, password: string = ''): ExtractedImage[] {
  const zip = new AdmZip(filePath)

  const zipEntries: ExtractedImage[] = []

  zip.getEntries().forEach((zipEntry) => {
    if (!zipEntry.isDirectory) {
      const extensionCheck = zipEntry.name.match(/\.(png|jpg|jpeg)/gi)
      if (extensionCheck !== null) {
        zipEntries.push({
          name: zipEntry.name,
          extension: extensionCheck[0],
          data: zipEntry.getData(password).toString('base64')
        })
      }
    }
  })

  return zipEntries
}
