'use client'
import { useRouter } from 'next/navigation'
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react"
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";
import contractAddress from "../contract_details/contractAddress";
import contractAbi from '../contract_details/contractAbi';
import { useApartmentStore } from '../hooks/useApartmentStore';
import { toast } from 'react-toastify';

export default function BookingActions({ price, apartmentId }) {
  const { address, caipAddress, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('eip155');
  const router = useRouter()
  const securityFee = 0.001; // returns a BigInt value
  

  //const securityFeeInEther = parseEther(securityFee);
  const priceInEther = parseEther(price);
  const setApartment = useApartmentStore(state => state.setApartment)
  //const totalInEther = priceInEther + securityFeeInEther;
  //const total = formatEther(totalInEther);
  const getBookingById = useApartmentStore((state) => state.getBookingById)
  const booking = getBookingById(1)
  console.log('booking total:', booking.total)
  //const total = booking.total + parseFloat(securityFee);
  

  //const fee = (securityFee * BigInt(booking.total)) / BigInt(100);

  // booking.total is a number in ETH
  //const totalInWei = parseEther(booking.total.toString()); // now BigInt
  const fee = (securityFee / 100) * booking.total;

  const total = (booking.total + fee);
  console.log("bookingDate:", booking.dates);
  console.log("apartmentID:", apartmentId);

  const handleBooking = async (e) => {
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

      const tx = await contract.bookApartment(apartmentId, booking.dates);

      console.log("tx:", tx);

      await toast.promise(
        tx.wait(),
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

  }

  return (
    <div className="border rounded-lg p-4 sticky top-4">
      <h2 className="text-xl font-semibold mb-4">Booking Details</h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span>Price per night:</span>
          <span>{price}ETH</span>
        </div>
        <div className="flex justify-between">
          <span>Total Booking Price:</span>
          <span>{booking.total}ETH</span>
        </div>
        <div className="flex justify-between">
          <span>Security Fee:</span>
          <span>{fee}ETH</span>
        </div>
        <div className="flex justify-between font-bold border-t pt-2">
          <span>Total Fee:</span>
          <span>{total}ETH</span>
        </div>
      </div>

      <button
        onClick={handleBooking}
        className="w-full py-2 px-4 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        Book Now
      </button>
    </div>
  )
}