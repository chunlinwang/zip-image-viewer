import { contextBridge, ipcRenderer, OpenDialogOptions } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import AdmZip from 'adm-zip'
import { extractFiles } from '../utils/extractFiles'
import { ExtractedImage } from '../utils/interface'

// Custom APIs for renderer
const api = {
  open: async (method: string, args: OpenDialogOptions): Promise<ExtractedImage[]> => {
    const fileObj = await ipcRenderer.invoke('dialog', method, args)
    let zipEntries: ExtractedImage[] = []

    if (!fileObj.canceled) {
      const [filePath = null] = fileObj.filePaths
      if (filePath) {
        const zip = new AdmZip(filePath)
        zipEntries = extractFiles(zip.getEntries())
      }
    }
    return zipEntries
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
