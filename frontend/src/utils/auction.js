import Web3 from 'web3';

const auction = {
    currentAuction: null,
  
    createAuction: async (nftContractAddress, tokenId, endTime) => {
      try {
        // Create a new Web3 instance
        const web3 = new Web3(window.ethereum); 
    
        // Parse the contract JSON 
        const artifact = require("../../contracts/AuctionEnglish.json");
        const abi = artifact.abi;
        const bytecode = artifact.bytecode;
    
        // Get the currently selected account
        const accounts = await web3.eth.getAccounts();
        const deployer = accounts[0]; 
    
        // Create a contract instance
        const contract = new web3.eth.Contract(abi);
    
        // Deploy the contract
        const deployedContract = await contract.deploy({
          data: bytecode,
          arguments: [nftContractAddress, tokenId, endTime]
        }).send({ from: deployer, gas: 5000000 }); 
    
        // Start the auction
        const auction = new web3.eth.Contract(abi, deployedContract.options.address);
        await auction.methods["startAuction"]().call();

        // Return the deployed contract address
        return deployedContract.options.address; 
    
      } catch (error) {
        console.error("Error deploying contract:", error);
        return null;
      }
    },
  
    placeBid: (walletAddress, bidAmount) => {
      if (!auction.currentAuction) throw new Error("No active auction.");
      if (auction.currentAuction.isClosed) throw new Error("The auction is closed.");
      if (Date.now() > auction.currentAuction.endTime) throw new Error("The auction has ended.");
      if (!walletAddress || bidAmount <= 0) throw new Error("Invalid bid details.");
  
      const { highestBid, bids } = auction.currentAuction;
  
      if (highestBid && bidAmount <= highestBid.amount) {
        throw new Error("Bid must be higher than the current highest bid.");
      }
  
      const newBid = { walletAddress, amount: bidAmount, time: Date.now() };
      auction.currentAuction.bids.push(newBid);
      auction.currentAuction.highestBid = newBid;
  
      return { message: "Bid placed successfully!", highestBid: newBid };
    },
  
    closeAuction: () => {
      if (!auction.currentAuction) throw new Error("No active auction to close.");
      if (auction.currentAuction.isClosed) throw new Error("Auction is already closed.");
      if (Date.now() < auction.currentAuction.endTime) throw new Error("Auction cannot be closed before its end time.");
  
      auction.currentAuction.isClosed = true;
  
      const winner = auction.currentAuction.highestBid
        ? { walletAddress: auction.currentAuction.highestBid.walletAddress, amount: auction.currentAuction.highestBid.amount }
        : null;
  
      return { message: "Auction closed.", winner };
    },
  };
  
  export default auction;
  