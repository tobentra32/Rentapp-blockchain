"use client"
import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react"
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { createApartment } from '../services/blockchain'

export default function Add() {

  const { address, caipAddress, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('eip155');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [rooms, setRooms] = useState('');
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState('');
  const [price, setPrice] = useState('');
  const [links, setLinks] = useState([]);
  const navigate = useRouter();

  const baseUrl = "https://res.cloudinary.com/dn1jishai/image/upload/v17233707463/rentapp-apartments/";



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !location || !category || !description || !rooms || links.length !== 5 || !price) {
      toast.error('Fill all fields and upload exactly 5 images');
      return;
    }

    const params = {
      name,
      description,
      category,
      location,
      rooms,
      images: links.join(','), // pass to contract
      price,
    };

    await toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          await createApartment(params);
          navigate.push('/');
          resolve();
        } catch {
          reject();
        }
      }),
      {
        pending: 'Approve transaction...',
        success: 'Apartment added successfully 👌',
        error: 'Encountered error 🤯',
      }
    );
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      console.log("data:",data.urls);
      if (data.urls) {
        setLinks((prev) => [...prev, ...data.urls].slice(0, 5)); // max 5
      }
    } catch (error) {
      console.error(error);
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="h-screen flex justify-center mx-auto">
      <div className="w-11/12 md:w-2/5 h-7/12 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex justify-center items-center">
            <p className="font-semibold text-black">Add Room</p>
          </div>

          <div className="flex flex-row justify-between items-center border border-gray-300 p-2 rounded-xl mt-5">
            <input
              className="block w-full text-sm
                text-slate-500 bg-transparent border-0
                focus:outline-none focus:ring-0"
              type="text"
              name="name"
              placeholder="Room Name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
            />
          </div>

          <div className="flex flex-row justify-between items-center border border-gray-300 p-2 rounded-xl mt-5">
            <input
              className="block w-full text-sm
                text-slate-500 bg-transparent border-0
                focus:outline-none focus:ring-0"
              type="number"
              step={0.01}
              min={0.01}
              name="price"
              placeholder="Price (ETH)"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              required
            />
          </div>

          <div className="flex flex-row justify-between items-center border border-gray-300 p-2 rounded-xl mt-5">
            <input
              className="block flex-1 text-sm
                text-slate-500 bg-transparent border-0
                focus:outline-none focus:ring-0"
              type="file"
              name="images"
              placeholder="Images"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
            />

            {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}

            
          </div>

          {/* Preview Uploaded Images */}
          <div className="flex flex-wrap gap-2 mt-4">
            {links.map((link, i) => {
              const fileName = link.split("/").pop(); //extract last part (filename + extension)
              console.log("file name:",fileName);
              return (
                <div key={i} className="relative">
                  <img src={`${baseUrl}${fileName}`} alt="" className="w-24 h-24 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <FaTimes />
                  </button>
                </div>
              );
            })}
          </div>

          <div
            className="flex flex-row justify-between items-center
          border border-gray-300 p-2 rounded-xl mt-5"
          >
            <input
              className="block w-full text-sm
                text-slate-500 bg-transparent border-0
                focus:outline-none focus:ring-0"
              type="text"
              name="location"
              placeholder="Location"
              onChange={(e) => setLocation(e.target.value)}
              value={location}
              required
            />
          </div>

          <div className="flex flex-row justify-between items-center
          border border-gray-300 p-2 rounded-xl mt-5">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Apartment Category
            </label>
            <select
              id="category"
              name="category"
              className="block w-full text-sm
                text-slate-500 bg-transparent border-0
                focus:outline-none focus:ring-0"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">-- Select a Category --</option>
              <option value="studio">Studio</option>
              <option value="1-bedroom">1 Bedroom</option>
              <option value="2-bedroom">2 Bedroom</option>
              <option value="penthouse">Penthouse</option>
            </select>
          </div>


          <div
            className="flex flex-row justify-between items-center
          border border-gray-300 p-2 rounded-xl mt-5"
          >
            <input
              className="block w-full text-sm
                text-slate-500 bg-transparent border-0
                focus:outline-none focus:ring-0"
              type="text"
              name="rooms"
              placeholder="Number of room"
              onChange={(e) => setRooms(e.target.value)}
              value={rooms}
              required
            />
          </div>

          <div
            className="flex flex-row justify-between items-center
          border border-gray-300 p-2 rounded-xl mt-5"
          >
            <textarea
              className="block w-full text-sm resize-none
                text-slate-500 bg-transparent border-0
                focus:outline-none focus:ring-0 h-20"
              type="text"
              name="description"
              placeholder="Room Description"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className={`flex flex-row justify-center items-center
            w-full text-white text-md bg-[#ff385c]
            py-2 px-5 rounded-full drop-shadow-xl hover:bg-white
            border-transparent border
            hover:hover:text-[#ff385c]
            hover:border-[#ff385c]
            mt-5 transition-all duration-500 ease-in-out ${
              !address ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!address}
          >
            Add Appartment
          </button>
        </form>
      </div>
    </div>
  )
}
