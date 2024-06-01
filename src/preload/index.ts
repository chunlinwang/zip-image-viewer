import { contextBridge, ipcRenderer, OpenDialogOptions } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { extractFiles } from '../utils/extractFiles'
import { ExtractedImage } from '../utils/interface'

// Custom APIs for renderer
const api = {
  open: async (method: string, args: OpenDialogOptions): Promise<null | string> => {
    const fileObj = await ipcRenderer.invoke('dialog', method, args)

    if (fileObj.canceled) {
      return null
    }

    const [filePath] = fileObj.filePaths

    return filePath
  },
  read: async (filePath, password = ''): Promise<ExtractedImage[]> => {
    let zipEntries: ExtractedImage[] = []

    if (filePath) {
      zipEntries = extractFiles(filePath, password)
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
