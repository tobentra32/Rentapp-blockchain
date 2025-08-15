"use client"
import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react"
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { BrowserProvider, Contract, parseEther } from "ethers";
import contractAddress from "../contract_details/contractAddress";
import contractAbi from '../contract_details/contractAbi';





export default function Add() {
  const { address, caipAddress, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('eip155');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [rooms, setRooms] = useState('');
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  const [price, setPrice] = useState('');
  const [links, setLinks] = useState([]);
  const router = useRouter();

  const baseUrl = "https://res.cloudinary.com/dn1jishai/image/upload/v17233707463/rentapp-apartments/";



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!isConnected) {
        toast.error('Please connect your wallet first');
        return;
      }
      if (!walletProvider) {
        toast.error('Wallet provider not found');
        return;
      }
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();

      const contract = new Contract(contractAddress, contractAbi, signer);
      console.log("name",name);
      console.log("name",location);
      console.log("name",category);
      console.log("name",description);
      console.log("name",rooms);
      console.log("name",images);
      console.log("price",price);


      if (!name || !location || !category || !description || !rooms || images.length !== 5 || !price) {
        toast.error('Fill all fields and upload exactly 5 images');
        console.log('Fill all fields and upload exactly 5 images');
        return;
      }

      const params = {
        name,
        description,
        category,
        location,
        images: images.join(','), 
        rooms,
        price,
      };
      console.log("params:",params);

      const tx = await contract.createAppartment(
        params.name,
        params.description,
        params.category,
        params.location,
        params.images,
        params.rooms,
        parseEther(params.price.toString())
      );

      console.log("tx:",tx);

      await toast.promise(
        tx.wait(),
        console.log("tx:",tx),
        {
          pending: 'Approve transaction...',
          success: 'Apartment added successfully 👌',
          error: 'Encountered error 🤯',
        }
      );
      router.push('/');
    } catch (error) {
      console.error('Error creating apartment:', error);
      toast.error(error.message);
    }
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
        const newLinks = [...links, ...data.urls].slice(0, 5);
        setLinks(newLinks);
        
        const imageFile = newLinks.map(link => link.split("/").pop());
        console.log("imageFile:", imageFile);

        //setLinks((prev) => [...prev, ...data.urls].slice(0, 5)); // max 5
        //const imageFile = links.map(link => link.split("/").pop()); //extract last part (filename + extension)
        //console.log('image:',imageFile);
        
        const newImages = [...images, ...imageFile].slice(0, 5);
        setImages(newImages);
        console.log("images:", images); // correct value

        
        toast.success('Images uploaded successfully');

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
    <div className="min-h-screen flex justify-center mx-auto pb-24">
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
              min={0.003}
              name="price"
              placeholder="Price (in POL)"
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
              //console.log("file name:",fileName);
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
          onClick={(e) => {
            if (!address) {
              e.preventDefault(); // Stop form submission
              toast.error('Please connect your wallet first');
            }
          }}
          className="flex flex-row justify-center items-center
            w-full text-white text-md bg-[#ff385c]
            py-2 px-5 rounded-full drop-shadow-xl hover:bg-white
            border-transparent border
            hover:text-[#ff385c]
            hover:border-[#ff385c]
            mt-5 transition-all duration-500 ease-in-out"
        >
          Add Apartment
        </button>

        </form>
      </div>
    </div>
  )
}
