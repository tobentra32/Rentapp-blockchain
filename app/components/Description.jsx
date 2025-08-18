export default function Description({ description }) {
  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Description</h2>
      <p className="text-gray-700 mb-6">{description}</p>  
    </div>
  )
}