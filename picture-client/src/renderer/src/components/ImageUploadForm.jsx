import React, { useState } from 'react';
import '../styles/ImageUploadForm.css';

const ImageUploadForm = ({ onAdd, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size exceeds 10MB limit');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
        setSelectedFile(file);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedFile) {
      setError('Please select an image');
      return;
    }

    try {
      setIsUploading(true);
      
      // Send original file to parent component without any modification
      await onAdd({
        imageFile: selectedFile,
        originalName: selectedFile.name,
        createdAt: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error adding photo:', error);
      setError('Failed to add photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Prevent modal click from bubbling to overlay
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={stopPropagation}>
        <div className="modal-header">
          <h2>Add New Photo</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="image">Select an Image *</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              required
              disabled={isUploading}
            />
          </div>

          {previewUrl && (
            <div className="image-preview">
              <img src={previewUrl} alt="Preview" />
              <p className="file-name">Selected: {selectedFile?.name}</p>
            </div>
          )}

          <div className="modal-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isUploading || !selectedFile}
            >
              {isUploading ? 'Uploading...' : 'Add Photo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImageUploadForm;