'use client'
import { useState } from 'react'

export default function ReviewList({ reviews = [], apartmentId }) {
  const [visibleReviews, setVisibleReviews] = useState(3)

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Reviews</h2>
        {reviews.length > 3 && (
          <button 
            onClick={() => setVisibleReviews(prev => prev === 3 ? reviews.length : 3)}
            className="text-blue-600 hover:underline"
          >
            {visibleReviews === 3 ? 'Show all' : 'Show less'}
          </button>
        )}
      </div>
      
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.slice(0, visibleReviews).map((review, index) => (
            <div key={index} className="border-b pb-4 last:border-0">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                  {review.reviewer.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{review.reviewer}</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
      )}
    </div>
  )
}