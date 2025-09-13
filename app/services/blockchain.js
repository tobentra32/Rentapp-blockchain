export const getBookedApartments = async (userAddress) => {
  try {
    const contract = await getContract()
    const apartmentIds = await contract.getBookedApartmentIds(userAddress)
    
    const apartments = await Promise.all(
      apartmentIds.map(async (id) => {
        const apartment = await contract.apartments(id)
        return {
          id: id.toNumber(),
          name: apartment.name,
          description: apartment.description,
          price: apartment.price,
          location: apartment.location,
          image: apartment.image,
          owner: apartment.owner,
          isBooked: apartment.isBooked
        }
      })
    )
    
    return apartments.filter(apt => apt.isBooked)
  } catch (error) {
    console.error('Error fetching booked apartments:', error)
    throw error
  }
}

export const getAllBookedApartments = async () => {
  try {
    const contract = await getContract()
    const apartmentCount = await contract.apartmentCount()
    
    const allApartments = []
    
    // Fetch all apartments
    for (let i = 1; i <= apartmentCount; i++) {
      const apartment = await contract.apartments(i)
      if (apartment.isBooked) {
        const booking = await contract.bookings(i)
        allApartments.push({
          id: i,
          name: apartment.name,
          description: apartment.description,
          price: apartment.price,
          location: apartment.location,
          image: apartment.image,
          owner: apartment.owner,
          isBooked: apartment.isBooked,
          tenant: booking.tenant,
          checkInDate: booking.checkInDate.toNumber(),
          checkOutDate: booking.checkOutDate.toNumber()
        })
      }
    }
    
    return allApartments
  } catch (error) {
    console.error('Error fetching all booked apartments:', error)
    throw error
  }
}