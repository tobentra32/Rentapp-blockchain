'use client'
import { useState } from 'react'
export function ImageGallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(images[0])

  return (
    <div className="space-y-4">
      <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-lg">
        <img 
          src={selectedImage} 
          alt="Main apartment view"
          className="w-full h-96 object-cover"
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(image)}
            className={`rounded-md overflow-hidden ${selectedImage === image ? 'ring-2 ring-blue-500' : ''}`}
          >
            <img 
              src={image} 
              alt={`Apartment view ${index + 1}`}
              className="w-full h-20 object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}