export async function fetchApartment(id) {
  const response = await fetch(`/api/apartments/${id}`)
  if (!response.ok) {
    return null
  }
  return await response.json()
}