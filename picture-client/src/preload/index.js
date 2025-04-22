import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  // Image operations
  uploadImage: (fileBuffer, originalName) => {
    console.log('Preload: Uploading image', originalName, 'length:', fileBuffer.length)
    return ipcRenderer.invoke('upload-image', fileBuffer, originalName)
  },
  getImages: () => {
    console.log('Preload: Getting all images')
    return ipcRenderer.invoke('get-images')
  },
  deleteImage: (fileName) => {
    console.log('Preload: Deleting image', fileName)
    return ipcRenderer.invoke('delete-image', fileName)
  },

  // Image editing operations
  rotateImage: (fileName, degrees) => {
    console.log('Preload: Rotating image', fileName, 'by', degrees, 'degrees')
    return ipcRenderer.invoke('rotate-image', fileName, degrees)
  },
  cropImage: (fileName, cropData) => {
    console.log('Preload: Cropping image', fileName, 'with data:', cropData)
    return ipcRenderer.invoke('crop-image', fileName, cropData)
  },
  addWatermark: (fileName, watermarkData) => {
    console.log('Preload: Adding watermark to image', fileName, 'with data:', watermarkData)
    return ipcRenderer.invoke('add-watermark', fileName, watermarkData)
  },
  convertToBW: (fileName) => {
    console.log('Preload: Converting image to black and white', fileName)
    return ipcRenderer.invoke('convert-bw', fileName)
  },
  saveEditedImage: (imageData, fileName, metadata = {}) => {
    console.log('Preload: Saving edited image based on', fileName, 'with metadata:', metadata)
    return ipcRenderer.invoke('save-edited-image', imageData, fileName, metadata)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
