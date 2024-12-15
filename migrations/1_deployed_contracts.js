// Defines how contracts are deployed.

const Auction = artifacts.require('AuctionEnglish');
const NFT = artifacts.require('NFT');
const AuctionSPSB = artifacts.require('AuctionSPSB');
const AuctionDutch = artifacts.require('AuctionDutch');

module.exports = async function (deployer){
    const endInMinutes = 1;
    const endTime = Math.floor(Date.now() / 1000) + 60 * endInMinutes;
    await deployer.deploy(NFT);
    await deployer.deploy(Auction, NFT.address, 0, endTime);

    // Deploy AuctionSPSB contract
    const nft2 = await NFT.deployed(); // Use the already deployed NFT contract
    const minPrice = web3.utils.toWei("1", "ether"); // Example min price
    const endTimeSPSB = Math.floor(Date.now() / 1000) + 10; // 10-second auction for SPSB
    await deployer.deploy(AuctionSPSB, nft2.address, 0, endTimeSPSB, minPrice);
    
    // Deploy AuctionDutch contract
    const nft3 = await NFT.deployed(); // Use the already deployed NFT contract
    const startingPrice = web3.utils.toWei("10", "ether"); // Example starting price
    const decrementPerSec = web3.utils.toWei("0.1", "ether"); // Example decrement per second
    const duration = 30; // Auction duration in seconds
    const endTimeDutch = Math.floor(Date.now() / 1000) + duration;
    await deployer.deploy(AuctionDutch, nft3.address, 0, Math.floor(Date.now() / 1000), endTimeDutch, startingPrice, decrementPerSec);
};


