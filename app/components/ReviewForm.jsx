'use client'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { BrowserProvider, Contract, parseEther } from "ethers";
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import { ethers } from 'ethers'
import contractAddress from "../contract_details/contractAddress";
import contractAbi from '../contract_details/contractAbi';
import { useApartmentStore } from '../hooks/useApartmentStore'

export default async function ReviewForm({ apartmentId }) {

  const { address, caipAddress, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('eip155');
  const ethersProvider = new BrowserProvider(walletProvider);
  const signer = await ethersProvider.getSigner();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const addReview = useApartmentStore(state => state.addReview)


  const submitReview = async (reviewData) => {
    if (!address) {
      toast.error('Please connect your wallet')
      return
    }

    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    if (!comment.trim()) {
      toast.error('Please enter your review')
      return
    }

    setIsSubmitting(true)

    try {
      
      const contract = new Contract(contractAddress, contractAbi, signer);

      const tx = await contract.addReview(
        apartmentId,
        rating,
        comment
      )

      await toast.promise(
        tx.wait(),
        {
          pending: 'Submitting review...',
          success: 'Review submitted successfully!',
          error: 'Failed to submit review'
        }
      )

      setRating(0)
      setComment('')
      addReview({
      ...reviewData,
      apartmentId,
      date: new Date().toISOString() })
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 mt-6">
      <h2 className="text-xl font-semibold mb-4">Add Your Review</h2>
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Rating</label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block mb-2">Review</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border rounded"
            rows="4"
            placeholder="Share your experience..."
          />
        </div>
        
        <button
          onClick={submitReview}
          disabled={isSubmitting || !address}
          className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 ${
            isSubmitting || !address ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </div>
  )
}