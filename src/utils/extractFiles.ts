import { ExtractedImage } from './interface'

export function extractFiles(entries): ExtractedImage[] {
  const zipEntries: { name: string; data: string; extension: string }[] = []

  entries.forEach((zipEntry) => {
    if (!zipEntry.isDirectory) {
      const extensionCheck = zipEntry.name.match(/\.(png|jpg|jpeg)/gi)
      if (extensionCheck !== null) {
        zipEntries.push({
          name: zipEntry.name,
          extension: extensionCheck[0],
          data: zipEntry.getData().toString('base64')
        })
      }
    }
  })

  return zipEntries
}
