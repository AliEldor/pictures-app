import React, { useState } from 'react';
import ImageEditor from './ImageEditor';
import '../styles/ImageCard.css';

const ImageCard = ({ photo, onEdit, onDelete }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      onDelete();
    }
  };
  
  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  const openPreview = () => {
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
  };

  
  const handleImageError = (e) => {
    console.error("Error loading image:", photo.imageUrl);
    e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
  };
  
  return (
    <>
      <div className="photo-card">
        <div className="photo-image-container" onClick={openPreview}>
          <div className="image-wrapper">
            <img 
              src={photo.imageUrl} 
              alt={photo.title || 'Photo'} 
              className="photo-image"
              onError={handleImageError}
            />
          </div>
          <div className="image-overlay">
            <span className="preview-icon">🔍</span>
          </div>
        </div>
        <div className="photo-info">
          <h3 className="photo-title" title={photo.title || 'Untitled'}>
            {photo.title || 'Untitled'}
          </h3>
          
          {photo.description && (
            <div className="photo-description">
              <p>{photo.description}</p>
            </div>
          )}
          
          <div className="photo-actions">
            <button 
              className="edit-btn" 
              onClick={handleEdit}
            >
              Edit
            </button>
            <button 
              className="delete-btn" 
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      
      {isEditModalOpen && (
        <ImageEditor 
          photo={photo} 
          onEdit={(editedPhoto) => {
            onEdit(editedPhoto);
            setIsEditModalOpen(false);
          }} 
          onClose={() => setIsEditModalOpen(false)} 
        />
      )}

      {isPreviewOpen && (
        <div className="image-preview-modal" onClick={closePreview}>
          <div className="preview-content">
            <img 
              src={photo.imageUrl} 
              alt={photo.title || 'Photo'} 
              className="preview-image"
              onError={handleImageError}
            />
            <button className="preview-close" onClick={closePreview}>&times;</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageCard;