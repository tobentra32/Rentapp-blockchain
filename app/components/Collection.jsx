// components/Collection.js
import Card from './Card';

export default function Collection({ apartments }) {
  return (
    <div className="py-8 px-4 sm:px-14 flex justify-center flex-wrap gap-8 w-full">
      {apartments.map((apartment) => (
        <Card key={apartment.id} apartment={apartment} />
      ))}
      {apartments.length === 0 && (
        <div className="text-center w-full py-12">
          <p className="text-gray-500 text-lg">No apartments available yet!</p>
        </div>
      )}
    </div>
  );
}