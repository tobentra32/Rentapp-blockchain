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

const polygonAmoyParams = {
  chainId: "0x13882", // 80002 in hex
  chainName: "Polygon Amoy Testnet",
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
  rpcUrls: ["https://rpc-amoy.polygon.technology"],
  blockExplorerUrls: ["https://www.oklink.com/amoy"],
};

async function switchToPolygonAmoy() {
  if (!window.ethereum) {
    alert("No crypto wallet found. Please install MetaMask or Trust Wallet.");
    return;
  }

  try {
    // Try switching to Polygon Amoy
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: polygonAmoyParams.chainId }],
    });
    console.log("✅ Switched to Polygon Amoy network");
  } catch (switchError) {
    // If the network is not added, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [polygonAmoyParams],
        });
        console.log("✅ Added and switched to Polygon Amoy");
      } catch (addError) {
        console.error("❌ Failed to add Polygon Amoy:", addError);
      }
    } else {
      console.error("❌ Failed to switch network:", switchError);
    }
  }
}


export async function fetchBookings(walletProvider) {
  if (!window.ethereum) {
    throw new Error("No wallet found. Please connect MetaMask or Trust Wallet.");
  }
  await switchToPolygonAmoy(); // ✅ ensure the user is on Polygon Amoy


  //const ethersProvider = new ethers.BrowserProvider(window.ethereum);
  const ethersProvider = new BrowserProvider(window.ethereum);
  const signer = await ethersProvider.getSigner();
  const contract = new Contract(contractAddress, contractAbi, signer);
  const bookings = await contract.getBookings(1);
  console.log("BOOKING:",bookings)
  return bookings.map((booking) => ({
    id: booking.id.toString(),
    //apartmentId: booking.apartmentId.toString(),
    //userId: booking.userId.toString(),
    startDate: new Date(Number(booking.startDate) * 1000),
    endDate: new Date(Number(booking.endDate) * 1000),
    price: parseFloat(ethers.formatEther(booking.price)),
    timestamp: new Date(Number(booking.timestamp) * 1000),
  }));


}


export async function fetchApartment(walletProvider, id) {

  const ethersProvider = new BrowserProvider(walletProvider);
  const signer = await ethersProvider.getSigner();

  const contract = new Contract(contractAddress, contractAbi, signer);

  const apt = await contract.getApartment(id);
  // Format to plain JS object
  return {
    name: apt.name,
    location: apt.location,
    description: apt.description,
    images: apt.images.split(","),
    price: apt.price.toString(), // BigNumber → string
    
  };



}