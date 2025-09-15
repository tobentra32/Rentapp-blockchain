export default function ApartmentTitle({ name, location}) {
  return (
    <div>
      <h1 className="text-3xl font-bold">{name}</h1>
      <div className="flex items-center mt-2">
        <span className="text-gray-600">{location}</span>
        <span className="ml-4 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
          ★ 
        </span>
      </div>
    </div>
  )
}