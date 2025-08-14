"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "../store/globalSlices";

import {
  Title,
  ImageGrid,
  Description,
  Calendar,
  Actions,
  Review,
  AddReview,
} from "../components/index";

export default function RoomClient({
  roomId,
  apartmentData,
  timestampsData,
  reviewsData,
  securityFee,
  qualifiedReviewers,
}) {
  const dispatch = useDispatch();
  const { address } = useAccount();

  const {
    setApartment,
    setTimestamps,
    setReviewModal,
    setReviews,
    setSecurityFee,
  } = globalActions;

  const { apartment, timestamps, reviews } = useSelector(
    (states) => states.globalStates
  );

  useEffect(() => {
    dispatch(setApartment(apartmentData));
    dispatch(setTimestamps(timestampsData));
    dispatch(setReviews(reviewsData));
    dispatch(setSecurityFee(securityFee));
  }, [
    dispatch,
    apartmentData,
    timestampsData,
    reviewsData,
    securityFee,
  ]);

  const handleReviewOpen = () => {
    dispatch(setReviewModal("scale-100"));
  };

  return (
    <div className="py-8 px-10 sm:px-20 md:px-32 space-y-8">
      <Title apartment={apartment} />

      <ImageGrid
        first={apartment?.images?.[0]}
        second={apartment?.images?.[1]}
        third={apartment?.images?.[2]}
        forth={apartment?.images?.[3]}
        fifth={apartment?.images?.[4]}
      />

      <Description apartment={apartment} />
      <Calendar apartment={apartment} timestamps={timestamps} />
      <Actions apartment={apartment} />

      <div className="flex flex-col justify-between flex-wrap space-y-2">
        <div className="flex justify-start items-center space-x-2">
          <h1 className="text-xl font-semibold">Reviews</h1>
          {qualifiedReviewers?.includes(address) && (
            <button
              className="cursor-pointer text-pink-500 hover:text-pink-700"
              onClick={handleReviewOpen}
            >
              Drop your review
            </button>
          )}
        </div>
        <div>
          {reviews.map((review, i) => (
            <Review key={i} review={review} />
          ))}
          {reviews.length < 1 && "No reviews yet!"}
        </div>
      </div>

      <AddReview roomId={roomId} />
    </div>
  );
}