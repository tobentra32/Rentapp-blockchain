import { notFound } from 'next/navigation'
import { useApartmentStore } from '../hooks/useApartmentStore'
import { ApartmentTitle, ImageGallery, Description, BookingCalendar, BookingActions, ReviewList, ReviewForm } from '../components/index'
import { fetchApartment } from '../lib/api'

export default async function ApartmentPage({ params }) {
  const apartment = await fetchApartment(params.id)
  
  if (!apartment) {
    return notFound()
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
          <Description 
            description={apartment.description}
          />
          
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
      
      <ReviewForm apartmentId={apartment.id} />
    </div>
  )
}

// Client component to initialize Zustand state
function ApartmentInitializer({ apartment }) {
  const { setApartment, setReviews, setSecurityFee } = useApartmentStore()
  
  useEffect(() => {
    setApartment(apartment)
    setReviews(apartment.reviews || [])
    setSecurityFee(50) // Example security fee
  }, [apartment, setApartment, setReviews, setSecurityFee])

  return null
}