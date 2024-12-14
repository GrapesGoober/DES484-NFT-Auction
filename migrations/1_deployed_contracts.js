const Auction = artifacts.require('Auction');
const NFT = artifacts.require('NFT');

module.exports = async function (deployer) {
  const endInMinutes = 1;
  const endTime = Math.floor(Date.now() / 1000) + 60 * endInMinutes;

  // Deploy NFT first and wait for it to be deployed
  await deployer.deploy(NFT);
  const nftInstance = await NFT.deployed();

  // Now deploy Auction, passing the NFT contract address
  await deployer.deploy(Auction, nftInstance.address, 0, endTime);
};
