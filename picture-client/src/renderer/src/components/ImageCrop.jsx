import React, { useState, useRef } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}

const ImageCrop = ({ imageUrl, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState()
  const [aspect, setAspect] = useState(undefined)
  const [completedCrop, setCompletedCrop] = useState(null)
  const imgRef = useRef(null)

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget
    // Initialize with a centered crop
    setCrop(centerAspectCrop(width, height, 16 / 9))
  }

  const handleCropChange = (pixelCrop, percentCrop) => {
    setCrop(percentCrop)
    setCompletedCrop(pixelCrop)
  }

  const handleAspectChange = (e) => {
    const value = e.target.value
    if (value === 'free') {
      setAspect(undefined)
    } else {
      const [width, height] = value.split(':').map(Number)
      setAspect(width / height)

      if (imgRef.current) {
        const { width: imgWidth, height: imgHeight } = imgRef.current
        setCrop(centerAspectCrop(imgWidth, imgHeight, width / height))
      }
    }
  }

  const handleApplyCrop = () => {
    if (!completedCrop || !imgRef.current) return

    onCropComplete({
      x: completedCrop.x,
      y: completedCrop.y,
      width: completedCrop.width,
      height: completedCrop.height
    })
  }

  return (
    <div className="crop-container">
      <div className="crop-controls">
        <div className="form-group">
          <label htmlFor="aspect-ratio">Aspect Ratio</label>
          <select id="aspect-ratio" onChange={handleAspectChange} defaultValue="free">
            <option value="free">Free</option>
            <option value="1:1">Square (1:1)</option>
            <option value="16:9">Landscape (16:9)</option>
            <option value="9:16">Portrait (9:16)</option>
            <option value="4:3">Standard (4:3)</option>
            <option value="3:2">Photo (3:2)</option>
          </select>
        </div>
      </div>

      <div className="crop-preview">
        <ReactCrop crop={crop} onChange={handleCropChange} aspect={aspect} circularCrop={false}>
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Crop preview"
            onLoad={onImageLoad}
            style={{ maxHeight: '400px' }}
          />
        </ReactCrop>
      </div>

      <div className="crop-actions">
        <button type="button" className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="apply-btn"
          onClick={handleApplyCrop}
          disabled={!completedCrop}
        >
          Apply Crop
        </button>
      </div>
    </div>
  )
}

export default ImageCrop
