import { NextResponse } from 'next/server'
import { apartments } from '../../../lib/data'

export async function GET(request, context) {
  const { id } = await context.params   // 👈 await here

  const apartment = apartments.find(a => a.id === id)

  if (!apartment) {
    return NextResponse.json({ error: 'Apartment not found' }, { status: 404 })
  }

  return NextResponse.json(apartment)
}
