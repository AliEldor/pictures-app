import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ImageCard from '../components/ImageCard'
import ImageUploadForm from '../components/ImageUploadForm'
import '../styles/Gallery.css'

const Gallery = () => {
  const navigate = useNavigate()
  const [images, setImages] = useState([])
  const [isUploadFormOpen, setIsUploadFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Store original filenames for uploaded images
  const [filenameMap, setFilenameMap] = useState({})

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    // Retrieve filename map from localStorage if available
    const storedFilenameMap = localStorage.getItem('filenameMap')
    if (storedFilenameMap) {
      try {
        setFilenameMap(JSON.parse(storedFilenameMap))
      } catch (err) {
        console.error('Error parsing filename map:', err)
      }
    }

    loadImages()
  }, [navigate])

  const loadImages = async () => {
    try {
      setLoading(true)

      if (window.api) {
        const images = await window.api.getImages()
        console.log('Loaded images:', images.length)

        const formattedImages = images.map((img) => {
          let displayName = ''

          if (filenameMap && filenameMap[img.name]) {
            displayName = filenameMap[img.name]
          } else if (img.originalName) {
            displayName = img.originalName

            const updatedMap = { ...filenameMap }
            updatedMap[img.name] = img.originalName
            setFilenameMap(updatedMap)
            localStorage.setItem('filenameMap', JSON.stringify(updatedMap))
          } else if (
            img.name.includes('_edited_') ||
            img.name.includes('_rotated_') ||
            img.name.includes('_watermarked_') ||
            img.name.includes('_bw_')
          ) {
            const baseName = img.name.split('_')[0]

            // Check if we have the original file's name im map
            if (baseName && filenameMap[`${baseName}${path.extname(img.name)}`]) {
              const originalFileName = filenameMap[`${baseName}${path.extname(img.name)}`]
              const originalBaseName = originalFileName.split('.')[0]
              displayName = originalBaseName
            } else {
              // Just use the file name without the suffixes
              const parts = img.name.split('_')
              if (parts[0] === 'image') {
                displayName = `Image ${images.indexOf(img) + 1}`
              } else {
                displayName = parts[0]
              }
            }

            if (img.name.includes('_edited_')) {
              displayName += ' (Edited)'
            } else if (img.name.includes('_rotated_')) {
              displayName += ' (Rotated)'
            } else if (img.name.includes('_watermarked_')) {
              displayName += ' (Watermarked)'
            } else if (img.name.includes('_bw_')) {
              displayName += ' (B&W)'
            }
          } else if (img.name.startsWith('image_')) {
            displayName = `Image ${images.indexOf(img) + 1}`
          } else {
            displayName = img.name.split('.')[0]
          }

          const date = new Date(img.timestamp).toLocaleDateString()
          const time = new Date(img.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })

          return {
            id: img.name,
            name: img.name,
            originalName: filenameMap[img.name] || img.originalName || img.name,
            title: displayName,
            description: `Uploaded on ${date} at ${time}`,
            imageUrl: img.relativePath,
            relativePath: img.relativePath,
            path: img.path,
            createdAt: new Date(img.timestamp).toISOString()
          }
        })

        setImages(formattedImages)
      } else {
        // Fallback to localStorage for web testing
        const storedImages = JSON.parse(localStorage.getItem('userImages') || '[]')
        setImages(storedImages)
      }

      setError(null)
    } catch (err) {
      console.error('Failed to load images:', err)
      setError('Failed to load images. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    navigate('/login')
  }

  const handleAddImage = async (newImage) => {
    try {
      if (window.api && newImage.imageFile) {
        setLoading(true)

        const originalFilename = newImage.imageFile.name

        const arrayBuffer = await newImage.imageFile.arrayBuffer()

        const uploadResult = await window.api.uploadImage(arrayBuffer, originalFilename)
        console.log('Upload result:', uploadResult)

        const updatedFilenameMap = { ...filenameMap }
        updatedFilenameMap[uploadResult.name] = originalFilename
        setFilenameMap(updatedFilenameMap)
        localStorage.setItem('filenameMap', JSON.stringify(updatedFilenameMap))

        await loadImages()

        setIsUploadFormOpen(false)
      } else {
        // Fallback
        const updatedImages = [
          ...images,
          {
            ...newImage,
            id: Date.now(),
            title: newImage.imageFile.name.split('.')[0], // Remove extension
            imageUrl: URL.createObjectURL(newImage.imageFile)
          }
        ]
        setImages(updatedImages)
        localStorage.setItem('userImages', JSON.stringify(updatedImages))

        setIsUploadFormOpen(false)
      }
    } catch (err) {
      console.error('Error adding image:', err)
      setError('Failed to add image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditImage = async (editedImage) => {
    try {
      await loadImages()
    } catch (err) {
      console.error('Error updating image in gallery:', err)
      setError('Failed to update image. Please try again.')
    }
  }

  const handleDeleteImage = async (imageId) => {
    try {
      if (window.api) {
        setLoading(true)

        await window.api.deleteImage(imageId)

        // Update filename map
        const updatedFilenameMap = { ...filenameMap }
        delete updatedFilenameMap[imageId]
        setFilenameMap(updatedFilenameMap)
        localStorage.setItem('filenameMap', JSON.stringify(updatedFilenameMap))

        // Refresh image list
        await loadImages()
      } else {
        // Fallback
        const updatedImages = images.filter((image) => image.id !== imageId)
        setImages(updatedImages)
        localStorage.setItem('userImages', JSON.stringify(updatedImages))
      }
    } catch (err) {
      console.error('Failed to delete image:', err)
      setError('Failed to delete image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const sortedImages = [...images].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h1>Photo Gallery</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="gallery-controls">
        <button className="add-photo-btn" onClick={() => setIsUploadFormOpen(true)}>
          Add New Photo
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && <div className="loading-message">Loading images...</div>}

      <div className="photo-grid">
        {!loading && sortedImages.length > 0
          ? sortedImages.map((image) => (
              <ImageCard
                key={image.id}
                photo={image}
                onEdit={handleEditImage}
                onDelete={() => handleDeleteImage(image.id)}
              />
            ))
          : !loading &&
            !error && (
              <p className="no-photos-message">No photos found. Add a new photo to get started.</p>
            )}
      </div>

      {isUploadFormOpen && (
        <ImageUploadForm onAdd={handleAddImage} onClose={() => setIsUploadFormOpen(false)} />
      )}
    </div>
  )
}

export default Gallery
