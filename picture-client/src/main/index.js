import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

// Define assets directory for storing images
function getAssetsDir() {
  // In development mode, use the src/assets path
  if (is.dev) {
    const assetsDir = path.join(__dirname, '../../src/renderer/src/assets/images')
    // Create the directory if it doesn't exist
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true })
    }
    return assetsDir
  } else {
    // In production mode, create a directory within the app resources
    const userDataPath = app.getPath('userData')
    const assetsDir = path.join(userDataPath, 'images')

    // Create the directory if it doesn't exist
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true })
    }

    return assetsDir
  }
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.maximize() // Start with maximized window
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools() // Open DevTools in development
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Create directory for images
  const assetsDir = getAssetsDir()
  console.log('Assets directory:', assetsDir)

  // Setup IPC handlers for image operations

  ipcMain.handle('upload-image', async (_, fileBuffer, originalName) => {
    try {
      console.log('Upload requested. Original filename:', originalName)

      const timestamp = Date.now()
      const fileExt = path.extname(originalName)
      const fileName = `image_${timestamp}${fileExt}`
      const filePath = path.join(assetsDir, fileName)

      console.log('Writing file to:', filePath)

      // Make sure fileBuffer is a valid buffer
      const buffer = Buffer.from(fileBuffer)

      // Write the file to disk
      fs.writeFileSync(filePath, buffer)
      console.log('File written successfully')

      let relativePath
      if (is.dev) {
        relativePath = `/src/assets/images/${fileName}`
      } else {
        relativePath = `app://images/${fileName}`
      }

      return {
        name: fileName,
        path: filePath,
        relativePath: relativePath,
        originalName: originalName,
        timestamp: timestamp
      }
    } catch (error) {
      console.error('Error saving image:', error)
      throw error
    }
  })

  ipcMain.handle('get-images', async () => {
    try {
      const files = fs.readdirSync(assetsDir)

      // Filter only image files
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
      const imageFiles = files.filter((file) => {
        const ext = path.extname(file).toLowerCase()
        return imageExtensions.includes(ext)
      })

      // Create image info objects
      const images = imageFiles
        .map((file) => {
          const filePath = path.join(assetsDir, file)
          const stats = fs.statSync(filePath)

          let relativePath
          if (is.dev) {
            relativePath = `/src/assets/images/${file}`
          } else {
            relativePath = `app://images/${file}`
          }

          return {
            name: file,
            path: filePath,
            relativePath: relativePath,
            timestamp: stats.mtimeMs,
            size: stats.size
          }
        })
        .sort((a, b) => b.timestamp - a.timestamp) // Sort by timestamp (newest first)

      return images
    } catch (error) {
      console.error('Error getting images:', error)
      throw error
    }
  })

  // Delete Image
  ipcMain.handle('delete-image', async (_, fileName) => {
    try {
      const filePath = path.join(assetsDir, fileName)

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        return { success: true, fileName }
      } else {
        throw new Error('File not found')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      throw error
    }
  })

  // Rotate Image
  ipcMain.handle('rotate-image', async (_, fileName, degrees) => {
    try {
      const inputPath = path.join(assetsDir, fileName)

      if (!fs.existsSync(inputPath)) {
        throw new Error('File not found')
      }

      // Create a temp file name
      const fileExt = path.extname(fileName)
      const baseName = path.basename(fileName, fileExt)
      const outputFileName = `${baseName}_rotated_${Date.now()}${fileExt}`
      const outputPath = path.join(assetsDir, outputFileName)

      await sharp(inputPath).rotate(degrees).toFile(outputPath)

      let relativePath
      if (is.dev) {
        relativePath = `/src/assets/images/${outputFileName}`
      } else {
        relativePath = `app://images/${outputFileName}`
      }

      // Get file stats
      const stats = fs.statSync(outputPath)

      return {
        success: true,
        name: outputFileName,
        path: outputPath,
        relativePath: relativePath,
        timestamp: stats.mtimeMs,
        size: stats.size
      }
    } catch (error) {
      console.error('Error rotating image:', error)
      throw error
    }
  })

  // Crop Image
  ipcMain.handle('crop-image', async (_, fileName, cropData) => {
    try {
      const inputPath = path.join(assetsDir, fileName)

      if (!fs.existsSync(inputPath)) {
        throw new Error('File not found')
      }

      // Create a temp file name
      const fileExt = path.extname(fileName)
      const baseName = path.basename(fileName, fileExt)
      const outputFileName = `${baseName}_cropped_${Date.now()}${fileExt}`
      const outputPath = path.join(assetsDir, outputFileName)

      // Process image with Sharp
      await sharp(inputPath)
        .extract({
          left: Math.round(cropData.x),
          top: Math.round(cropData.y),
          width: Math.round(cropData.width),
          height: Math.round(cropData.height)
        })
        .toFile(outputPath)

      // For development, calculate the relative path for the React app
      let relativePath
      if (is.dev) {
        relativePath = `/src/assets/images/${outputFileName}`
      } else {
        relativePath = `app://images/${outputFileName}`
      }

      // Get file stats
      const stats = fs.statSync(outputPath)

      return {
        success: true,
        name: outputFileName,
        path: outputPath,
        relativePath: relativePath,
        timestamp: stats.mtimeMs,
        size: stats.size
      }
    } catch (error) {
      console.error('Error cropping image:', error)
      throw error
    }
  })

  ipcMain.handle('add-watermark', async (_, fileName, watermarkData) => {
    try {
      const inputPath = path.join(assetsDir, fileName)

      if (!fs.existsSync(inputPath)) {
        throw new Error('File not found')
      }

      // Check if watermark text exists
      if (!watermarkData.text || watermarkData.text.trim() === '') {
        throw new Error('Watermark text is required')
      }

      // Create a new file name
      const fileExt = path.extname(fileName)
      const baseName = path.basename(fileName, fileExt)
      const outputFileName = `${baseName}_watermarked_${Date.now()}${fileExt}`
      const outputPath = path.join(assetsDir, outputFileName)

      // Get image metadata
      const metadata = await sharp(inputPath).metadata()

      // Get watermark position coordinates
      let x, y
      const padding = 20

      switch (watermarkData.position) {
        case 'topLeft':
          x = padding
          y = padding + (watermarkData.fontSize || 36)
          break
        case 'topRight':
          x = metadata.width - padding
          y = padding + (watermarkData.fontSize || 36)
          break
        case 'bottomLeft':
          x = padding
          y = metadata.height - padding
          break
        case 'bottomRight':
        default:
          x = metadata.width - padding
          y = metadata.height - padding
          break
        case 'center':
          x = metadata.width / 2
          y = metadata.height / 2
          break
      }

      // Create an SVG text overlay
      const svgText = Buffer.from(`
        <svg width="${metadata.width}" height="${metadata.height}">
          <style>
            .watermark {
              fill: ${watermarkData.color || 'rgba(255, 255, 255, 0.5)'};
              font-family: Arial;
              font-size: ${watermarkData.fontSize || 36}px;
            }
          </style>
          <text 
            x="${x}" 
            y="${y}" 
            text-anchor="${watermarkData.position === 'center' ? 'middle' : watermarkData.position.includes('Right') ? 'end' : 'start'}"
            class="watermark"
          >
            ${watermarkData.text}
          </text>
        </svg>
      `)

      // Apply watermark with Sharp
      await sharp(inputPath)
        .composite([
          {
            input: svgText,
            top: 0,
            left: 0
          }
        ])
        .toFile(outputPath)

      // For development, calculate the relative path for the React app
      let relativePath
      if (is.dev) {
        relativePath = `/src/assets/images/${outputFileName}`
      } else {
        relativePath = `app://images/${outputFileName}`
      }

      // Get file stats
      const stats = fs.statSync(outputPath)

      return {
        success: true,
        name: outputFileName,
        path: outputPath,
        relativePath: relativePath,
        timestamp: stats.mtimeMs,
        size: stats.size
      }
    } catch (error) {
      console.error('Error adding watermark:', error)
      throw error
    }
  })

  // Convert to Black and White
  ipcMain.handle('convert-bw', async (_, fileName) => {
    try {
      const inputPath = path.join(assetsDir, fileName)

      if (!fs.existsSync(inputPath)) {
        throw new Error('File not found')
      }

      // Create a temp file name
      const fileExt = path.extname(fileName)
      const baseName = path.basename(fileName, fileExt)
      const outputFileName = `${baseName}_bw_${Date.now()}${fileExt}`
      const outputPath = path.join(assetsDir, outputFileName)

      // Process image with Sharp
      await sharp(inputPath).grayscale().toFile(outputPath)

      // For development, calculate the relative path for the React app
      let relativePath
      if (is.dev) {
        relativePath = `/src/assets/images/${outputFileName}`
      } else {
        relativePath = `app://images/${outputFileName}`
      }

      // Get file stats
      const stats = fs.statSync(outputPath)

      return {
        success: true,
        name: outputFileName,
        path: outputPath,
        relativePath: relativePath,
        timestamp: stats.mtimeMs,
        size: stats.size
      }
    } catch (error) {
      console.error('Error converting to B&W:', error)
      throw error
    }
  })

  // Save edited image
  ipcMain.handle('save-edited-image', async (_, imageData, fileName, metadata = {}) => {
    try {
      // Base64 data URL format: data:image/png;base64,iVBORw0KGgo...
      const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)

      if (!matches || matches.length !== 3) {
        throw new Error('Invalid image data URL')
      }

      // Extract content type and base64 data
      const type = matches[1]
      const buffer = Buffer.from(matches[2], 'base64')

      // Create new file name based on original
      const fileExt = path.extname(fileName) || '.png'
      const baseName = path.basename(fileName, fileExt)
      const outputFileName = `${baseName}_edited_${Date.now()}${fileExt}`
      const outputPath = path.join(assetsDir, outputFileName)

      // Write the file
      fs.writeFileSync(outputPath, buffer)

      // For development, calculate the relative path for the React app
      let relativePath
      if (is.dev) {
        relativePath = `/src/assets/images/${outputFileName}`
      } else {
        relativePath = `app://images/${outputFileName}`
      }

      // Get file stats
      const stats = fs.statSync(outputPath)

      return {
        success: true,
        name: outputFileName,
        path: outputPath,
        relativePath: relativePath,
        timestamp: stats.mtimeMs,
        size: stats.size,
        // Include the metadata in the response
        metadata: metadata
      }
    } catch (error) {
      console.error('Error saving edited image:', error)
      throw error
    }
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
