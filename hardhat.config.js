require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
      version: "0.8.20",
      networks: {
          hardhat: {
              chainId: 80002,
          },
      },
      settings: {
          optimizer: {
              enabled: true,
              runs: 200,
          },
      },
  },
};
