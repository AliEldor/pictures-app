import React, { useState, useRef, useEffect } from 'react'
import '../styles/ImageEditor.css'

const ImageEditor = ({ photo, onEdit, onClose }) => {
  const [activeTab, setActiveTab] = useState('rotate')

  // Image manipulation states
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Canvas refs for image manipulation
  const canvasRef = useRef(null)
  const imageRef = useRef(null)

  const [rotationAngle, setRotationAngle] = useState(0)
  const [watermarkText, setWatermarkText] = useState('')
  const [watermarkOptions, setWatermarkOptions] = useState({
    position: 'bottomRight',
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.7)'
  })

  useEffect(() => {
    const loadImage = async () => {
      try {
        const img = new Image()
        img.crossOrigin = 'Anonymous'

        img.onload = () => {
          imageRef.current = img
          if (canvasRef.current) {
            drawImageToCanvas(img)
          }
        }

        img.onerror = (e) => {
          console.error('Failed to load image:', e)
          setError('Failed to load image. Please try again.')
        }

        // Handle different path formats
        if (photo.relativePath) {
          img.src = photo.relativePath
        } else if (photo.imageUrl) {
          img.src = photo.imageUrl
        } else {
          setError('Image path not found')
        }
      } catch (err) {
        console.error('Error loading image:', err)
        setError('Failed to load image: ' + (err.message || 'Unknown error'))
      }
    }

    loadImage()
  }, [photo])

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

  const applyRotation = () => {
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

        setRotationAngle(0)
        setSuccess('Image rotated successfully')
        setIsProcessing(false)
      }

      rotatedImage.src = tempCanvas.toDataURL('image/png')
    } catch (err) {
      console.error('Error rotating image:', err)
      setError('Failed to rotate image')
      setIsProcessing(false)
    }
  }

  const applyBlackAndWhite = () => {
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
  }

  // Apply watermark
  const applyWatermark = () => {
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
  }

  // Save all changes - Direct conversion from canvas to buffer
  const handleSave = async () => {
    if (!canvasRef.current) {
      setError('No image data available')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      // Get the final image data from canvas as base64
      const imageDataUrl = canvasRef.current.toDataURL('image/png')

      // Extract original filename without extension
      const origFileName = photo.name || 'image'
      const fileExt = origFileName.includes('.')
        ? origFileName.substring(origFileName.lastIndexOf('.'))
        : '.png'
      const baseName = origFileName.includes('.')
        ? origFileName.substring(0, origFileName.lastIndexOf('.'))
        : origFileName

      // Create a timestamp for the edited image
      const timestamp = Date.now()

      // Generate an appropriate edit indicator based on which tab was used
      let editType = ''
      if (activeTab === 'rotate' && rotationAngle !== 0) {
        editType = 'rotated'
      } else if (activeTab === 'watermark' && watermarkText.trim() !== '') {
        editType = 'watermarked'
      } else if (activeTab === 'blackWhite') {
        editType = 'bw'
      } else {
        editType = 'edited'
      }

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

        // upload as a new image using the upload api
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

          // Send update to parent component
          onEdit(updatedPhoto)
          setSuccess('Changes saved successfully')

          setTimeout(() => onClose(), 1000)
        } else {
          throw new Error('Failed to save image')
        }
      } else {
        // Fallback
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
      const img = new Image()
      img.crossOrigin = 'Anonymous'

      img.onload = () => {
        imageRef.current = img
        drawImageToCanvas(img)
        setSuccess('Image reset to original')
      }

      // Use the original image url
      if (photo.relativePath) {
        img.src = photo.relativePath
      } else if (photo.imageUrl) {
        img.src = photo.imageUrl
      }
    } catch (err) {
      console.error('Error resetting image:', err)
      setError('Failed to reset image')
    }
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
            <div className="canvas-container">
              <canvas ref={canvasRef} className="edit-canvas" />
            </div>
          </div>

          <div className="controls-section">
            <div className="tab-content">
              {activeTab === 'rotate' && (
                <div className="rotate-tab">
                  <div className="form-group">
                    <label htmlFor="rotation">Rotation Angle (degrees)</label>
                    <input
                      type="number"
                      id="rotation"
                      value={rotationAngle}
                      onChange={(e) => setRotationAngle(Number(e.target.value))}
                      min="-360"
                      max="360"
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="rotation-presets">
                    <button
                      type="button"
                      onClick={() => setRotationAngle(90)}
                      disabled={isProcessing}
                    >
                      90°
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotationAngle(180)}
                      disabled={isProcessing}
                    >
                      180°
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotationAngle(270)}
                      disabled={isProcessing}
                    >
                      270°
                    </button>
                  </div>

                  <button
                    type="button"
                    className="apply-btn"
                    onClick={applyRotation}
                    disabled={isProcessing || rotationAngle === 0}
                  >
                    {isProcessing ? 'Applying...' : 'Apply Rotation'}
                  </button>
                </div>
              )}

              {activeTab === 'watermark' && (
                <div className="watermark-tab">
                  <div className="form-group">
                    <label htmlFor="watermarkText">Watermark Text</label>
                    <input
                      type="text"
                      id="watermarkText"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="Enter watermark text"
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="watermarkPosition">Position</label>
                    <select
                      id="watermarkPosition"
                      value={watermarkOptions.position}
                      onChange={(e) =>
                        setWatermarkOptions({
                          ...watermarkOptions,
                          position: e.target.value
                        })
                      }
                      disabled={isProcessing}
                    >
                      <option value="bottomRight">Bottom Right</option>
                      <option value="center">Center</option>
                      <option value="topLeft">Top Left</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    className="apply-btn"
                    onClick={applyWatermark}
                    disabled={isProcessing || !watermarkText.trim()}
                  >
                    {isProcessing ? 'Applying...' : 'Apply Watermark'}
                  </button>
                </div>
              )}

              {activeTab === 'blackWhite' && (
                <div className="black-white-tab">
                  <p>Convert this image to black and white.</p>
                  <button
                    type="button"
                    className="apply-btn"
                    onClick={applyBlackAndWhite}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Converting...' : 'Convert to Black & White'}
                  </button>
                </div>
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
