import React, { useEffect, useRef } from 'react';

const ImageCanvas = ({ imageRef, setCanvasRef }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (canvasRef.current) {
      setCanvasRef(canvasRef);
      
      // draw image if imageRef is available
      if (imageRef.current) {
        drawImageToCanvas(imageRef.current);
      }
    }
  }, [imageRef, setCanvasRef]);
  
  const drawImageToCanvas = (image) => {
    if (!canvasRef.current || !image) return;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        console.error('Failed to get 2D context');
        return;
      }

      // Set canvas dimensions to match image
      canvas.width = image.width;
      canvas.height = image.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      return canvas;
    } catch (err) {
      console.error('Error drawing image to canvas:', err);
    }
  };

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} className="edit-canvas" />
    </div>
  );
};

export default ImageCanvas;