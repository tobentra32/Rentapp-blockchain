const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


const tokenAddress = "0xb48123DB6bAaa2F65fe86736D3A60c7326E03F8f";




module.exports = buildModule("RentdappModule", (m) => {

  const address = m.getParameter("address", tokenAddress);
  
  

  const rentdapp = m.contract("Rentdapp", [address]);

  return { rentdapp };
});