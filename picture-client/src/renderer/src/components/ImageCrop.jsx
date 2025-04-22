import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 50, 
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const ImageCrop = ({ imageUrl, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState();
  const [aspect, setAspect] = useState(undefined);
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const onImageLoad = (e) => {
    setIsLoading(false);
    
    // Store the natural dimensions of the image
    const { naturalWidth, naturalHeight } = e.currentTarget;
    console.log('Natural image dimensions for crop:', naturalWidth, 'x', naturalHeight);
    
    imgRef.current = e.currentTarget;
    
    // initialize with a centered crop
    const initialCrop = centerAspectCrop(naturalWidth, naturalHeight, aspect);
    setCrop(initialCrop);
  };

  const handleCropChange = (newCrop) => {
    setCrop(newCrop);
    setCompletedCrop(newCrop);
  };

  const handleAspectChange = (e) => {
    const value = e.target.value;
    
    if (value === 'free') {
      setAspect(undefined);
    } else {
      const [width, height] = value.split(':').map(Number);
      setAspect(width / height);
      
      if (imgRef.current) {
        const { naturalWidth, naturalHeight } = imgRef.current;
        setCrop(centerAspectCrop(naturalWidth, naturalHeight, width / height));
      }
    }
  };

  const handleApplyCrop = () => {
    if (!completedCrop || !imgRef.current) {
      setError('Please select a crop area first');
      return;
    }
    
    // Convert percentage values to pixel values using natural dimensions
    const { naturalWidth, naturalHeight } = imgRef.current;
    console.log('Image natural dimensions:', naturalWidth, 'x', naturalHeight);
    console.log('Crop percentage values:', completedCrop);
    
    const pixelCrop = {
      x: Math.round((completedCrop.x / 100) * naturalWidth),
      y: Math.round((completedCrop.y / 100) * naturalHeight),
      width: Math.round((completedCrop.width / 100) * naturalWidth),
      height: Math.round((completedCrop.height / 100) * naturalHeight)
    };
    
    console.log('Sending pixel crop data:', pixelCrop);
    
    onCropComplete(pixelCrop);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError('Failed to load image for cropping');
  };

  return (
    <div className="crop-container">
      {error && <div className="error-message">{error}</div>}
      
      <div className="crop-controls">
        <div className="form-group">
          <label htmlFor="aspect-ratio">Aspect Ratio</label>
          <select 
            id="aspect-ratio" 
            onChange={handleAspectChange}
            defaultValue="free"
          >
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
        {isLoading && <div className="loading-indicator">Loading image...</div>}
        <ReactCrop
          crop={crop}
          onChange={handleCropChange}
          aspect={aspect}
          circularCrop={false}
          ruleOfThirds={true}
        >
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Crop preview"
            onLoad={onImageLoad}
            onError={handleImageError}
            style={{ 
              maxHeight: '400px', 
              maxWidth: '100%',
              objectFit: 'contain' 
            }}
          />
        </ReactCrop>
      </div>
      
      <div className="crop-message">
        Drag the corners to adjust the selection area. Everything outside this area will be removed.
      </div>
      
      <div className="crop-actions">
        <button 
          type="button"
          className="cancel-btn"
          onClick={onCancel}
        >
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
  );
};

export default ImageCrop;