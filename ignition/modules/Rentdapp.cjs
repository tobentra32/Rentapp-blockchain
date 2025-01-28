const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


const tokenAddress = "0x7321e158b5578C87721203839c5355266c81cd24";




module.exports = buildModule("RentdappModule", (m) => {

  const address = m.getParameter("address", tokenAddress);
  
  

  const rentdapp = m.contract("Rentdapp", [address]);

  return { rentdapp };
});