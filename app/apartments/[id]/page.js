import { notFound } from 'next/navigation'
import { 
  ApartmentTitle, 
  ImageGallery, 
  Description, 
  BookingCalendar, 
  BookingActions, 
  ReviewList, 
  ReviewForm 
} from '../../components/index'
import { fetchApartment } from '../../lib/api'
import ApartmentInitializer from './ApartmentInitializer'  // 👈 import client component

export default async function ApartmentPage({ params }) {
  const { id } = await params;
  const apartment = await fetchApartment(id);

  if (!apartment) {
    return notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ApartmentInitializer apartment={apartment} />
      
      <ApartmentTitle 
        name={apartment.name} 
        location={apartment.location} 
        rating={apartment.rating} 
      />
      
      <ImageGallery images={apartment.images} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-8">
          <Description description={apartment.description} />
          <BookingCalendar 
            bookedDates={apartment.bookedDates}
            price={apartment.price}
          />
        </div>
        
        <div className="lg:col-span-1">
          <BookingActions 
            price={apartment.price}
            apartmentId={apartment.id}
          />
        </div>
      </div>
      
      <ReviewList apartmentId={apartment.id} />
      

      
    </div>
  )
}
