export async function fetchApartment(id) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? `http://localhost:3000`;

  const res = await fetch(`${base}/api/apartments/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch apartment ${id}: ${res.status}`);
  return res.json();
}
