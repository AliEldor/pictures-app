import React from 'react';

const BlackWhiteImage = ({ isProcessing, applyBlackAndWhite }) => {
  return (
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
  );
};

export default BlackWhiteImage;