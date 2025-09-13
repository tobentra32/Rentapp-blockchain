// lib/rentdapp.js
import { ethers } from "ethers";

import { BrowserProvider, Contract, parseEther } from "ethers";
import contractAddress from "../contract_details/contractAddress";
import contractAbi from "../contract_details/contractAbi";

export async function getAllApartments(walletProvider) {
  //const { address, caipAddress, isConnected } = useAppKitAccount();
  //const { walletProvider } = useAppKitProvider("eip155");

  const ethersProvider = new BrowserProvider(walletProvider);
  const signer = await ethersProvider.getSigner();

  const contract = new Contract(contractAddress, contractAbi, signer);

  const apartments = await contract.getApartments();
  return apartments.map((apt) => ({
    id: apt.id.toString(),
    name: apt.name,
    description: apt.description,
    images: apt.images.split(","),
    price: parseFloat(ethers.formatEther(apt.price)),
    timestamp: new Date(Number(apt.timestamp) * 1000),
    location: apt.location,
    rooms: apt.rooms.toString(),
    category: apt.category,
    deleted: apt.deleted,
  }));
}
