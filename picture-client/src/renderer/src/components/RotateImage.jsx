import React, { useState } from 'react';

const RotateImage = ({ isProcessing, applyRotation }) => {
  const [rotationAngle, setRotationAngle] = useState(0);

  const handleApplyRotation = () => {
    applyRotation(rotationAngle);
  };

  return (
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
        onClick={handleApplyRotation}
        disabled={isProcessing || rotationAngle === 0}
      >
        {isProcessing ? 'Applying...' : 'Apply Rotation'}
      </button>
    </div>
  );
};

export default RotateImage;