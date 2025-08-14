import RoomClient from "./RoomClient";
import {
  getReviews,
  getApartment,
  getBookedDates,
  getSecurityFee,
  getQualifiedReviewers,
} from "../services/blockchain";

export async function generateMetadata({ params }) {
  const apartment = await getApartment(params.roomId);
  return {
    title: `Room | ${apartment?.name || "Loading..."}`,
    icons: { icon: "/favicon.ico" },
  };
}

export default async function RoomPage({ params }) {
  const roomId = params.roomId;

  const [
    apartmentData,
    timestampsData,
    qualifiedReviewers,
    reviewsData,
    securityFee,
  ] = await Promise.all([
    getApartment(roomId),
    getBookedDates(roomId),
    getQualifiedReviewers(roomId),
    getReviews(roomId),
    getSecurityFee(),
  ]);

  return (
    <RoomClient
      roomId={roomId}
      apartmentData={JSON.parse(JSON.stringify(apartmentData))}
      timestampsData={JSON.parse(JSON.stringify(timestampsData))}
      reviewsData={JSON.parse(JSON.stringify(reviewsData))}
      qualifiedReviewers={JSON.parse(JSON.stringify(qualifiedReviewers))}
      securityFee={JSON.parse(JSON.stringify(securityFee))}
    />
  );
}
