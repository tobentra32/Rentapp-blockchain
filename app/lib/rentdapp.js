// lib/rentdapp.js
import { ethers } from 'ethers';

export async function getAllApartments() {
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const contractAbi = (await import('../contract_details/contractAbi.json')).default;
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    contractAbi.abi,
    provider
  );

  const apartments = await contract.getApartments();
  return apartments.map(apt => ({
    id: apt.id.toString(),
    name: apt.name,
    description: apt.description,
    images: apt.images.split(','),
    price: parseFloat(ethers.formatEther(apt.price)),
    timestamp: new Date(apt.timestamp * 1000),
    location: apt.location,
    rooms: apt.rooms.toString(),
    category: apt.category,
    deleted: apt.deleted
  }));
}