"use client"
import { useState, useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react"
import { toast } from 'react-toastify'
import { useRouter, useParams } from 'next/navigation'
import { BrowserProvider, Contract, formatEther } from "ethers"
import contractAddress from "../../../contract_details/contractAddress"
import contractAbi from '../../../contract_details/contractAbi'

export default function Edit() {
  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('eip155')
  const { id } = useParams()
  const router = useRouter()

  const [apartment, setApartment] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [links, setLinks] = useState([])

  const baseUrl = "https://res.cloudinary.com/dn1jishai/image/upload/v17233707463/rentapp-apartments/"

  useEffect(() => {
    async function loadData() {
        try {
        if (!walletProvider) return;

        const ethersProvider = new BrowserProvider(walletProvider);
        const signer = await ethersProvider.getSigner();
        const contract = new Contract(contractAddress, contractAbi, signer);

        const data = await contract.getApartment(id);

        // Normalize images: handle "csv string" OR array OR missing
        const imagesArray = typeof data.images === 'string'
            ? data.images
                .split(',')
                .map(s => s.trim())           // trim spaces
                .filter(img => img && img !== '…') // remove empty / weird chars
            : Array.isArray(data.images)
            ? data.images
            : [];

        const apt = {
            id,
            name: data.name,
            location: data.location,
            category: data.category,
            description: data.description,
            images: imagesArray,               // <- always an array now
            rooms: data.rooms,
            price: formatEther(data.price),
        };

        setApartment(apt);

        // build full URLs for preview links
        setLinks(imagesArray.map(img => `${baseUrl}${img}`));

        // OPTIONAL: debug
        // console.log("imagesArray", imagesArray);
        } catch (err) {
        console.error("Error fetching apartment:", err);
        }
    }

    loadData();
 }, [walletProvider, id]);


  if (!apartment) {
    return <p className="text-center mt-10">Loading apartment...</p>
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setApartment((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    setUploading(true)
    const formData = new FormData()
    files.forEach((file) => formData.append('images', file))

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (data.urls) {
        const newLinks = [...links, ...data.urls].slice(0, 5)
        setLinks(newLinks)

        const imageFiles = newLinks.map(link => link.split("/").pop())
        setApartment((prev) => ({ ...prev, images: imageFiles }))

        toast.success('Images uploaded successfully')
      }
    } catch (error) {
      console.error(error)
      toast.error('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index) => {
    const newLinks = links.filter((_, i) => i !== index)
    setLinks(newLinks)
    setApartment((prev) => ({
      ...prev,
      images: newLinks.map(link => link.split("/").pop())
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        if (!walletProvider) {
        alert("Please connect your wallet first");
        return;
        }

        const ethersProvider = new BrowserProvider(walletProvider);
        const signer = await ethersProvider.getSigner();
        const contract = new Contract(contractAddress, contractAbi, signer);

        // Normalize images before sending (filenames only)
        const filenames = links.map((link) => link.split("/").pop());

        // Convert ETH price back to wei
        const priceInWei = parseEther(apartment.price.toString());

        console.log("📤 Updating apartment on contract with:", {
        id,
        ...apartment,
        images: filenames,
        price: priceInWei.toString(),
        });

        const tx = await contract.updateApartment(
        id,
        apartment.name,
        apartment.location,
        apartment.category,
        apartment.description,
        filenames,
        apartment.rooms,
        priceInWei
        );

        console.log("⏳ Waiting for transaction:", tx.hash);
        await tx.wait();
        console.log("✅ Apartment updated successfully!");

        alert("Apartment updated successfully!");
    } catch (err) {
        console.error("❌ Error updating apartment:", err);
        alert("Failed to update apartment, check console for details");
    }
    };


  return (
    <div className="min-h-screen flex justify-center mx-auto pb-24">
      <div className="w-11/12 md:w-2/5 h-7/12 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex justify-center items-center">
            <p className="font-semibold text-black">Edit Apartment</p>
          </div>

          <input
            className="border p-2 rounded-xl mt-5"
            type="text"
            name="name"
            placeholder="Room Name"
            value={apartment.name}
            onChange={handleChange}
          />

          <input
            className="border p-2 rounded-xl mt-5"
            type="number"
            step={0.01}
            min={0.003}
            name="price"
            placeholder="Price (in POL)"
            value={apartment.price}
            onChange={handleChange}
          />

          <input
            className="border p-2 rounded-xl mt-5"
            type="file"
            name="images"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
          />

          {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}

          <div className="flex flex-wrap gap-2 mt-4">
            {links.map((link, i) => (
              <div key={i} className="relative">
                <img src={link} alt="" className="w-24 h-24 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>

          <input
            className="border p-2 rounded-xl mt-5"
            type="text"
            name="location"
            placeholder="Location"
            value={apartment.location}
            onChange={handleChange}
          />

          <select
            className="border p-2 rounded-xl mt-5"
            name="category"
            value={apartment.category}
            onChange={handleChange}
          >
            <option value="">-- Select a Category --</option>
            <option value="studio">Studio</option>
            <option value="1-bedroom">1 Bedroom</option>
            <option value="2-bedroom">2 Bedroom</option>
            <option value="penthouse">Penthouse</option>
          </select>

          <input
            className="border p-2 rounded-xl mt-5"
            type="text"
            name="rooms"
            placeholder="Number of room"
            value={apartment.rooms}
            onChange={handleChange}
          />

          <textarea
            className="border p-2 rounded-xl mt-5 resize-none"
            name="description"
            placeholder="Room Description"
            value={apartment.description}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="w-full mt-5 py-2 px-5 rounded-full text-white bg-[#ff385c] hover:bg-white hover:text-[#ff385c] hover:border-[#ff385c] border transition-all"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}
