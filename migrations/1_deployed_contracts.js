// Defines how contracts are deployed.

const Auction = artifacts.require('Auction');

module.exports = function (deployer){
    const endInMinutes = 1;
    const endTime = Math.floor(Date.now() / 1000) + 60 * endInMinutes;
    deployer.deploy(Auction, endTime);
};


