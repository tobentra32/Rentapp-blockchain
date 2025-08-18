import { NextResponse } from 'next/server'
import { apartments } from '@/lib/data'

export async function GET(request, { params }) {
  const apartment = apartments.find(a => a.id === params.id)
  
  if (!apartment) {
    return NextResponse.json({ error: 'Apartment not found' }, { status: 404 })
  }

  return NextResponse.json(apartment)
}