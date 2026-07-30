const { app, BrowserWindow, Menu, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const { autoUpdater } = require('electron-updater')

let mainWindow

// --- Window state persistence ---
const stateFile = path.join(app.getPath('userData'), 'window-state.json')

function loadWindowState() {
  try {
    return JSON.parse(fs.readFileSync(stateFile, 'utf8'))
  } catch {
    return {}
  }
}

function saveWindowState() {
  if (!mainWindow) return
  try {
    const bounds = mainWindow.getBounds()
    const maximized = mainWindow.isMaximized()
    fs.writeFileSync(stateFile, JSON.stringify({ ...bounds, maximized }))
  } catch {}
}

function createWindow() {
  const saved = loadWindowState()

  mainWindow = new BrowserWindow({
    width: saved.width || 1200,
    height: saved.height || 800,
    x: saved.x,
    y: saved.y,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '..', 'icon-512.svg'),
    title: 'CyberSec Hub',
    backgroundColor: '#0a0d0d',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  if (saved.maximized) mainWindow.maximize()

  mainWindow.loadFile(path.join(__dirname, '..', 'index.html'))

  mainWindow.once('ready-to-show', () => mainWindow.show())

  mainWindow.on('close', saveWindowState)
  mainWindow.on('resize', saveWindowState)
  mainWindow.on('move', saveWindowState)

  mainWindow.on('closed', () => { mainWindow = null })
}

// --- App menu ---
const menuTemplate = [
  {
    label: 'File',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { role: 'resetZoom' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      { type: 'separator' },
      { role: 'toggleDevTools' }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'About CyberSec Hub',
        click: () => {
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'About CyberSec Hub',
            message: 'CyberSec Hub v' + app.getVersion(),
            detail: 'Learn Cybersecurity From Scratch\n\nEducational Use Only'
          })
        }
      }
    ]
  }
]

// --- Auto-updater ---
function setupAutoUpdater() {
  autoUpdater.autoDownload = false

  autoUpdater.on('update-available', (info) => {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: `CyberSec Hub v${info.version} is available.`,
      detail: 'Download and install the update now?',
      buttons: ['Download', 'Later'],
      defaultId: 0,
      cancelId: 1
    }).then(({ response }) => {
      if (response === 0) autoUpdater.downloadUpdate()
    })
  })

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded. Restart to install?',
      buttons: ['Restart', 'Later'],
      defaultId: 0,
      cancelId: 1
    }).then(({ response }) => {
      if (response === 0) autoUpdater.quitAndInstall()
    })
  })

  autoUpdater.on('error', (err) => {
    console.error('Auto-updater error:', err)
  })

  mainWindow.webContents.once('did-finish-load', () => {
    autoUpdater.checkForUpdates().catch(() => {})
  })
}

app.whenReady().then(() => {
  createWindow()
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
  setupAutoUpdater()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
