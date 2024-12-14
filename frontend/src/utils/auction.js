const auction = {
    currentAuction: null,
  
    createAuction: (tokenId, endTime) => {
      if (!tokenId || !endTime) throw new Error("Token ID and End Time are required.");
      if (new Date(endTime).getTime() <= Date.now()) throw new Error("End time must be in the future.");
  
      auction.currentAuction = {
        tokenId,
        endTime: new Date(endTime).getTime(),
        highestBid: null,
        bids: [],
        isClosed: false,
      };
      return auction.currentAuction;
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
  