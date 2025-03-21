"use client"
import React, { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const BuyToken = () => {
  const [amount, setAmount] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [loading, setLoading] = useState(false);
  

  const handleBuyToken = async () => {
    if (!amount || isNaN(amount)) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);

      // Connect to the user's wallet
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      // Replace with your contract address and ABI
      const contractAddress = "0xb48123DB6bAaa2F65fe86736D3A60c7326E03F8f";
      const contractABI = [
        "function buyTokens() external payable"
      ];

      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Convert amount to Wei and send transaction
      const value = ethers.parseEther(amount);
      const tx = await contract.buyTokens({ value });

      await tx.wait();
      alert("Transaction successful! Tokens purchased.");
    } catch (error) {
      console.error(error);
      alert("Transaction failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {

    if (account) {
       // const provider = new ethers.providers.Web3Provider(window.ethereum);
        const _balance = await provider.getBalance(account);
        setBalance(ethers.formatEther(_balance)); // Convert balance to ether
      console.log("pol balance", balance);
    }





  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">
            Buy Tokens
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Enter Amount (POL):
            </label>
            <Input
              id="amount"
              type="number"
              placeholder="e.g., 0.5"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
            />
          </div>

          

          <Button
            onClick={handleBuyToken}
            className="w-full mt-4"
            disabled={loading || !amount}
          >
            {loading ? "Processing..." : "Buy Tokens"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyToken;
