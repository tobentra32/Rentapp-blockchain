// components/Card.js
import { useState } from 'react';
import Link from 'next/link';
import { FaStar, FaEthereum, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function Card({ apartment }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex(prev => 
      prev === apartment.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? apartment.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="shadow-lg rounded-xl overflow-hidden w-full sm:w-96">
      <Link href={`/apartment/${apartment.id}`}>
        <div className="relative h-64 bg-gray-200">
          {apartment.images?.length > 0 && (
            <>
              <img
                src={apartment.images[currentImageIndex]}
                alt={apartment.name}
                className="w-full h-full object-cover"
              />
              
              {/* Image gallery controls */}
              {apartment.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  >
                    <FaChevronRight />
                  </button>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
                    {apartment.images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex 
                            ? 'bg-white' 
                            : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg">{apartment.name}</h3>
          <div className="flex items-center">
            <FaEthereum className="text-purple-600 mr-1" />
            <span className="font-semibold">{apartment.price} ETH</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm mt-1">{apartment.location}</p>
        <div className="flex justify-between items-center mt-3 text-sm">
          <span className="text-gray-500">
            {apartment.rooms} {apartment.rooms === '1' ? 'room' : 'rooms'}
          </span>
          <div className="flex items-center">
            <FaStar className="text-yellow-400 mr-1" />
            <span>New</span>
          </div>
        </div>
      </div>
    </div>
  );
}