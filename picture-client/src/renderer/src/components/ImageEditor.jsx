import React, { useState, useRef, useEffect, useCallback } from 'react'
import '../styles/ImageEditor.css'
import RotateImage from './RotateImage'
import WatermarkImage from './WatermarkImage'
import BlackWhiteImage from './BlackWhiteImage'
import ImageCanvas from './ImageCanvas'
import ImageCrop from './ImageCrop'

const ImageEditor = ({ photo, onEdit, onClose }) => {
  const [editorPhase, setEditorPhase] = useState('initial') 
  const [activeTab, setActiveTab] = useState('rotate')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    // Set the image url from photo props
    if (photo.relativePath) {
      setImageUrl(photo.relativePath)
    } else if (photo.imageUrl) {
      setImageUrl(photo.imageUrl)
    } else {
      setError('Image path not found')
    }
  }, [photo])

  // Load image into canvas when entering edit phase
  useEffect(() => {
    if (editorPhase === 'edit') {
      loadImageToCanvas()
    }
  }, [editorPhase])

  // Load image into canvas
  const loadImageToCanvas = async () => {
    try {
      setIsProcessing(true)

      const img = new Image()
      img.crossOrigin = 'Anonymous'

      img.onload = () => {
        imageRef.current = img
        if (canvasRef.current) {
          drawImageToCanvas(img)
        }
        setIsProcessing(false)
      }

      img.onerror = (e) => {
        console.error('Failed to load image:', e)
        setError('Failed to load image. Please try again.')
        setIsProcessing(false)
      }

      img.src = imageUrl
    } catch (err) {
      console.error('Error loading image:', err)
      setError('Failed to load image: ' + (err.message || 'Unknown error'))
      setIsProcessing(false)
    }
  }

  // Draw current image to canvas
  const drawImageToCanvas = (image) => {
    if (!canvasRef.current || !image) return

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        console.error('Failed to get 2D context')
        return
      }

      // Set canvas dimensions to match image
      canvas.width = image.width
      canvas.height = image.height

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

      return canvas
    } catch (err) {
      console.error('Error drawing image to canvas:', err)
      setError('Error displaying image. Please try again.')
    }
  }

  const handleCropComplete = async (cropData) => {
    if (!cropData) {
      setError('Invalid crop data')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const img = new Image()
      img.crossOrigin = 'Anonymous'

      img.onload = () => {
        // Create a temporary canvas for cropping
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d')

        // Set the canvas size to the crop dimensions
        tempCanvas.width = cropData.width
        tempCanvas.height = cropData.height

        tempCtx.drawImage(
          img,
          cropData.x,
          cropData.y,
          cropData.width,
          cropData.height,
          0,
          0,
          cropData.width,
          cropData.height
        )

        const croppedImageUrl = tempCanvas.toDataURL('image/png')

        // Update the image URL to the cropped version
        setImageUrl(croppedImageUrl)

        // Move to the edit phase
        setEditorPhase('edit')
        setSuccess('Image cropped successfully')
        setIsProcessing(false)
      }

      img.onerror = (e) => {
        console.error('Error loading image for crop:', e)
        setError('Failed to load image for cropping')
        setIsProcessing(false)
      }

      img.src = imageUrl
    } catch (err) {
      console.error('Error cropping image:', err)
      setError('Failed to crop image: ' + (err.message || 'Unknown error'))
      setIsProcessing(false)
    }
  }

  const handleSkipCrop = () => {
    setEditorPhase('edit')
  }

  // Apply rotation
  const applyRotation = useCallback((rotationAngle) => {
    if (!imageRef.current || !canvasRef.current || rotationAngle === 0) return

    setIsProcessing(true)
    setError('')

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      // Create a temporary canvas for rotation
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')

      const useSwappedDimensions = Math.abs(rotationAngle % 180) === 90
      const canvasWidth = useSwappedDimensions ? imageRef.current.height : imageRef.current.width
      const canvasHeight = useSwappedDimensions ? imageRef.current.width : imageRef.current.height

      tempCanvas.width = canvasWidth
      tempCanvas.height = canvasHeight

      // Move to center of canvas
      tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2)

      // Rotate canvas
      tempCtx.rotate((rotationAngle * Math.PI) / 180)

      // Draw the image centered and rotated
      tempCtx.drawImage(
        imageRef.current,
        -imageRef.current.width / 2,
        -imageRef.current.height / 2,
        imageRef.current.width,
        imageRef.current.height
      )

      // Create a new image from the temp canvas
      const rotatedImage = new Image()
      rotatedImage.crossOrigin = 'Anonymous'

      rotatedImage.onload = () => {
        imageRef.current = rotatedImage

        // Update the main canvas
        canvas.width = rotatedImage.width
        canvas.height = rotatedImage.height
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(rotatedImage, 0, 0)

        setSuccess('Image rotated successfully')
        setIsProcessing(false)
      }

      rotatedImage.src = tempCanvas.toDataURL('image/png')
    } catch (err) {
      console.error('Error rotating image:', err)
      setError('Failed to rotate image')
      setIsProcessing(false)
    }
  }, [])

  // Apply black and white effect
  const applyBlackAndWhite = useCallback(() => {
    if (!imageRef.current || !canvasRef.current) return

    setIsProcessing(true)
    setError('')

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height)

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Convert to grayscale
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
        data[i] = avg // red
        data[i + 1] = avg // green
        data[i + 2] = avg // blue
      }

      // Put the modified data back
      ctx.putImageData(imageData, 0, 0)

      const bwImage = new Image()
      bwImage.crossOrigin = 'Anonymous'

      bwImage.onload = () => {
        imageRef.current = bwImage
        setSuccess('Converted to black and white')
        setIsProcessing(false)
      }

      bwImage.src = canvas.toDataURL('image/png')
    } catch (err) {
      console.error('Error applying black and white:', err)
      setError('Failed to convert to black and white')
      setIsProcessing(false)
    }
  }, [])

  // Apply watermark
  const applyWatermark = useCallback((watermarkText, watermarkOptions) => {
    if (!imageRef.current || !canvasRef.current || !watermarkText.trim()) {
      if (!watermarkText.trim()) {
        setError('Please enter watermark text')
      }
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      // Draw current image to canvas
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height)

      // Configure text
      ctx.font = `${watermarkOptions.fontSize}px Arial`
      ctx.fillStyle = watermarkOptions.color

      const textMetrics = ctx.measureText(watermarkText)
      const textWidth = textMetrics.width

      let x, y
      const padding = 20

      switch (watermarkOptions.position) {
        case 'topLeft':
          x = padding
          y = padding + watermarkOptions.fontSize
          break
        case 'center':
          x = (canvas.width - textWidth) / 2
          y = canvas.height / 2
          break
        case 'bottomRight':
        default:
          x = canvas.width - textWidth - padding
          y = canvas.height - padding
          break
      }

      ctx.fillText(watermarkText, x, y)

      // Create a new image from the canvas
      const watermarkedImage = new Image()
      watermarkedImage.crossOrigin = 'Anonymous'

      watermarkedImage.onload = () => {
        imageRef.current = watermarkedImage
        setSuccess('Watermark added')
        setIsProcessing(false)
      }

      watermarkedImage.src = canvas.toDataURL('image/png')
    } catch (err) {
      console.error('Error applying watermark:', err)
      setError('Failed to add watermark')
      setIsProcessing(false)
    }
  }, [])

  const handleSave = async () => {
    if (editorPhase === 'crop') {
      setEditorPhase('edit')
      return
    }

    if (!canvasRef.current) {
      setError('No image data available')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const imageDataUrl = canvasRef.current.toDataURL('image/png')

      const origFileName = photo.name || 'image'
      const fileExt = origFileName.includes('.')
        ? origFileName.substring(origFileName.lastIndexOf('.'))
        : '.png'
      const baseName = origFileName.includes('.')
        ? origFileName.substring(0, origFileName.lastIndexOf('.'))
        : origFileName

      const timestamp = Date.now()

      // Generate an edit indicator based on which tab was used
      let editType =
        editorPhase === 'crop'
          ? 'cropped'
          : activeTab === 'rotate'
            ? 'rotated'
            : activeTab === 'watermark'
              ? 'watermarked'
              : activeTab === 'blackWhite'
                ? 'bw'
                : 'edited'

      // Create a new file name that includes the original name and edit type
      const newFileName = `${baseName}_${editType}_${timestamp}${fileExt}`

      if (window.api && window.api.uploadImage) {
        const base64Data = imageDataUrl.split(',')[1]
        const binaryData = atob(base64Data)
        const array = new Uint8Array(binaryData.length)

        for (let i = 0; i < binaryData.length; i++) {
          array[i] = binaryData.charCodeAt(i)
        }

        // Convert to ArrayBuffer
        const arrayBuffer = array.buffer

        console.log('Uploading edited image as:', newFileName)

        // Upload as a new image
        const result = await window.api.uploadImage(arrayBuffer, newFileName)
        console.log('Upload result:', result)

        if (result) {
          const updatedPhoto = {
            id: result.name,
            name: result.name,
            relativePath: result.relativePath,
            imageUrl: result.relativePath,
            createdAt: new Date().toISOString()
          }

          onEdit(updatedPhoto)
          setSuccess('Changes saved successfully')

          setTimeout(() => onClose(), 1000)
        } else {
          throw new Error('Failed to save image')
        }
      } else {
        // Fallback val
        const updatedPhoto = {
          id: `edited_${Date.now()}`,
          name: newFileName,
          imageData: imageDataUrl,
          imageUrl: imageDataUrl,
          updatedAt: new Date().toISOString()
        }

        onEdit(updatedPhoto)
        setSuccess('Changes saved successfully')

        setTimeout(() => onClose(), 1000)
      }
    } catch (err) {
      console.error('Error saving changes:', err)
      setError('Failed to save changes: ' + (err.message || 'Unknown error'))
    } finally {
      setIsProcessing(false)
    }
  }

  // Reset to original image
  const resetImage = () => {
    try {
      if (editorPhase === 'crop') {
        // if in crop phase, just restart the crop process
        if (photo.relativePath) {
          setImageUrl(photo.relativePath)
        } else if (photo.imageUrl) {
          setImageUrl(photo.imageUrl)
        }
        setEditorPhase('initial')
        return
      }

      const img = new Image()
      img.crossOrigin = 'Anonymous'

      img.onload = () => {
        imageRef.current = img
        drawImageToCanvas(img)
        setSuccess('Image reset to original')
      }

      img.src = imageUrl
    } catch (err) {
      console.error('Error resetting image:', err)
      setError('Failed to reset image')
    }
  }

  // set the canvas ref
  const setCanvasRef = (ref) => {
    canvasRef.current = ref.current
  }

  // wizard screen
  if (editorPhase === 'initial') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content edit-photo-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Edit Photo</h2>
            <button className="close-btn" onClick={onClose}>
              &times;
            </button>
          </div>

          <div className="edit-wizard">
            <h3>Would you like to crop this image first?</h3>
            <p>Cropping your image before applying other edits is often recommended.</p>

            <div className="wizard-preview">
              <img src={imageUrl} alt="Preview" style={{ maxHeight: '300px', maxWidth: '100%' }} />
            </div>

            <div className="wizard-actions">
              <button className="skip-btn" onClick={handleSkipCrop} disabled={isProcessing}>
                Skip Cropping
              </button>
              <button
                className="crop-btn"
                onClick={() => setEditorPhase('crop')}
                disabled={isProcessing}
              >
                Crop Image
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  //  crop phase
  if (editorPhase === 'crop') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content edit-photo-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Crop Photo</h2>
            <button className="close-btn" onClick={onClose}>
              &times;
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="crop-editor">
            <ImageCrop
              imageUrl={imageUrl}
              onCropComplete={handleCropComplete}
              onCancel={() => setEditorPhase('edit')}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="skip-btn"
              onClick={handleSkipCrop}
              disabled={isProcessing}
            >
              Skip Cropping
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-photo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Photo</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="edit-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'rotate' ? 'active' : ''}`}
            onClick={() => setActiveTab('rotate')}
          >
            Rotate
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'watermark' ? 'active' : ''}`}
            onClick={() => setActiveTab('watermark')}
          >
            Watermark
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'blackWhite' ? 'active' : ''}`}
            onClick={() => setActiveTab('blackWhite')}
          >
            Black & White
          </button>
        </div>

        <div className="editor-layout">
          <div className="canvas-section">
            <ImageCanvas imageRef={imageRef} setCanvasRef={setCanvasRef} />
          </div>

          <div className="controls-section">
            <div className="tab-content">
              {activeTab === 'rotate' && (
                <RotateImage isProcessing={isProcessing} applyRotation={applyRotation} />
              )}

              {activeTab === 'watermark' && (
                <WatermarkImage isProcessing={isProcessing} applyWatermark={applyWatermark} />
              )}

              {activeTab === 'blackWhite' && (
                <BlackWhiteImage
                  isProcessing={isProcessing}
                  applyBlackAndWhite={applyBlackAndWhite}
                />
              )}
            </div>
          </div>
        </div>

        <div className="modal-actions edit-actions">
          <button type="button" className="reset-btn" onClick={resetImage} disabled={isProcessing}>
            Reset Image
          </button>
          <div>
            <button type="button" className="cancel-btn" onClick={onClose} disabled={isProcessing}>
              Cancel
            </button>
            <button type="button" className="save-btn" onClick={handleSave} disabled={isProcessing}>
              {isProcessing ? 'Saving...' : 'Save as New'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageEditor
