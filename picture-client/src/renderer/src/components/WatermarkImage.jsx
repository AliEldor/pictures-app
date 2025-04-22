import React, { useState } from 'react';

const WatermarkImage = ({ isProcessing, applyWatermark }) => {
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkOptions, setWatermarkOptions] = useState({
    position: 'bottomRight',
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.7)'
  });

  const handleApplyWatermark = () => {
    applyWatermark(watermarkText, watermarkOptions);
  };

  // Font size options
  const fontSizes = [14, 18, 24, 32, 48, 64];

  // Color options 
  const colorOptions = [
    { label: 'White', value: 'rgba(255, 255, 255, 0.7)' },
    { label: 'White (More Visible)', value: 'rgba(255, 255, 255, 0.9)' },
    { label: 'Black', value: 'rgba(0, 0, 0, 0.7)' },
    { label: 'Black (More Visible)', value: 'rgba(0, 0, 0, 0.9)' },
    { label: 'Red', value: 'rgba(255, 0, 0, 0.7)' },
    { label: 'Blue', value: 'rgba(0, 0, 255, 0.7)' },
    { label: 'Green', value: 'rgba(0, 128, 0, 0.7)' },
    { label: 'Yellow', value: 'rgba(255, 255, 0, 0.7)' }
  ];

  return (
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
          <option value="topLeft">Top Left</option>
          <option value="topRight">Top Right</option>
          <option value="center">Center</option>
          <option value="bottomLeft">Bottom Left</option>
          <option value="bottomRight">Bottom Right</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="watermarkFontSize">Font Size</label>
        <select
          id="watermarkFontSize"
          value={watermarkOptions.fontSize}
          onChange={(e) =>
            setWatermarkOptions({
              ...watermarkOptions,
              fontSize: Number(e.target.value)
            })
          }
          disabled={isProcessing}
        >
          {fontSizes.map(size => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="watermarkColor">Color</label>
        <select
          id="watermarkColor"
          value={watermarkOptions.color}
          onChange={(e) =>
            setWatermarkOptions({
              ...watermarkOptions,
              color: e.target.value
            })
          }
          disabled={isProcessing}
        >
          {colorOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="watermark-preview" style={{ 
        padding: '10px', 
        marginTop: '10px',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px',
        textAlign: 'center'
      }}>
        <p style={{ 
          margin: '0', 
          color: watermarkOptions.color.replace(/[^,]+(?=\))/, '1'),
          fontSize: `${watermarkOptions.fontSize}px`
        }}>
          {watermarkText || 'Preview watermark text'}
        </p>
      </div>

      <button
        type="button"
        className="apply-btn"
        onClick={handleApplyWatermark}
        disabled={isProcessing || !watermarkText.trim()}
        style={{ marginTop: '15px' }}
      >
        {isProcessing ? 'Applying...' : 'Apply Watermark'}
      </button>
    </div>
  );
};

export default WatermarkImage;