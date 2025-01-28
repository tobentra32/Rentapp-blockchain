const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


const maxTotalSupply = ethers.parseEther("1000000");
const tokenPrice = ethers.parseEther("0.001");

const tokenName = "ilesanmi";
const tokenSymbol = "ILE";



module.exports = buildModule("TokenModule", (m) => {

  
  
  const name = m.getParameter("name", tokenName);
  const symbol = m.getParameter("symbol", tokenSymbol);
  const totalSupply = m.getParameter("totalSupply", maxTotalSupply);
  const price = m.getParameter("price", tokenPrice);
  

  const token = m.contract("Token", [name, symbol, totalSupply, price]);

  return { token };
});

