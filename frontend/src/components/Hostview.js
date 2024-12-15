import React, { useState } from "react";
import auction from "../utils/auction";

const HostView = () => {
  const [auctionDetails, setAuctionDetails] = useState({ nftAddress: "", tokenId: "", endTime: "" });
  const [message, setMessage] = useState("");

  const handleCreateAuction = () => {
    try {
      auction.createAuction(auctionDetails.nftAddress, auctionDetails.tokenId, auctionDetails.endTime);
      setMessage("Auction created successfully!");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div>
      <h2>Host View</h2>
      <input
        type="text"
        placeholder="NFT Address"
        value={auctionDetails.nftAddress}
        onChange={(e) => setAuctionDetails({ ...auctionDetails, nftAddress: e.target.value })}
      />
      <input
        type="text"
        placeholder="NFT Token ID"
        value={auctionDetails.tokenId}
        onChange={(e) => setAuctionDetails({ ...auctionDetails, tokenId: e.target.value })}
      />
      <input
        type="datetime-local"
        value={auctionDetails.endTime}
        onChange={(e) => setAuctionDetails({ ...auctionDetails, endTime: e.target.value })}
      />
      <button onClick={handleCreateAuction}>Create Auction</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default HostView;
