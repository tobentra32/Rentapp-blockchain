const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("RentdappModule", (m) => {


  const rentdapp = m.contract("Rentdapp");

  return { rentdapp };
});