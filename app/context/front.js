const allowance = await tokenContract.allowance(userAddress, contractAddress);

if (allowance.lt(applicationFee)) {
    // Step 2: Use Permit if insufficient allowance
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour expiry

    const domain = {
        name: "MyToken",
        version: "1",
        chainId: chainId,
        verifyingContract: tokenAddress,
    };

    const types = {
        Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
        ],
    };

    const values = {
        owner: userAddress,
        spender: contractAddress,
        value: applicationFee,
        nonce: await tokenContract.nonces(userAddress),
        deadline: deadline,
    };

    const signature = await signer._signTypedData(domain, types, values);
    const { v, r, s } = ethers.utils.splitSignature(signature);

    // Step 3: Call createApartmentWithPermit with signature
    const tx = await contract.createApartmentWithPermit(
        "Apartment 1",
        ethers.utils.parseUnits("100", 18), // price
        deadline,
        v,
        r,
        s
    );
    await tx.wait();
} else {
    // Step 4: Skip permit and directly call transfer
    const tx = await contract.createApartmentWithPermit(
        "Apartment 1",
        ethers.utils.parseUnits("100", 18), // price
        0, // No permit needed, set 0 as deadline
        0, // Dummy values for v, r, s
        ethers.constants.HashZero,
        ethers.constants.HashZero
    );
    await tx.wait();
}
