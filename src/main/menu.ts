import { app, Menu, shell, BrowserWindow, MenuItemConstructorOptions } from 'electron'

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string
  submenu?: DarwinMenuItemConstructorOptions[] | Menu
}

export default class MenuBuilder {
  mainWindow: BrowserWindow
  zipEntries: { name: string; data: string }[] = []

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
  }

  buildMenu(): Menu {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
      this.setupDevelopmentEnvironment()
    }

    const template =
      process.platform === 'darwin' ? this.buildDarwinTemplate() : this.buildDefaultTemplate()

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    return menu
  }

  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: (): void => {
            this.mainWindow.webContents.inspectElement(x, y)
          }
        }
      ]).popup({ window: this.mainWindow })
    })
  }

  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const subMenuAbout: DarwinMenuItemConstructorOptions = {
      label: 'Zip Image Viewer',
      submenu: [
        {
          label: 'About Zip Image Viewer',
          selector: 'orderFrontStandardAboutPanel:'
        },
        { type: 'separator' },
        // { label: 'Services', submenu: [] },
        // { type: 'separator' },
        {
          label: 'Hide Zip Image Viewer',
          accelerator: 'Command+H',
          selector: 'hide:'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:'
        },
        { label: 'Show All', selector: 'unhideAllApplications:' },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: (): void => {
            app.quit()
          }
        }
      ]
    }
    const subMenuViewDev: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: (): void => {
            this.mainWindow.webContents.reload()
          }
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: (): void => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen())
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: (): void => {
            this.mainWindow.webContents.toggleDevTools()
          }
        }
      ]
    }
    const subMenuViewProd: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: (): void => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen())
          }
        }
      ]
    }
    const subMenuWindow: DarwinMenuItemConstructorOptions = {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:'
        },
        { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
        { type: 'separator' },
        { label: 'Bring All to Front', selector: 'arrangeInFront:' }
      ]
    }
    const subMenuHelp: MenuItemConstructorOptions = {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More Electronjs',
          click(): void {
            shell.openExternal('https://electronjs.org')
          }
        }
      ]
    }

    const subMenuView =
      process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'
        ? subMenuViewDev
        : subMenuViewProd

    return [subMenuAbout, subMenuView, subMenuWindow, subMenuHelp]
  }

  buildDefaultTemplate() {
    const templateDefault = [
      {
        label: 'Help',
        submenu: [
          {
            label: 'Learn More Electronjs',
            click(): void {
              shell.openExternal('https://electronjs.org')
            }
          }
        ]
      }
    ]

    return templateDefault
  }
}
