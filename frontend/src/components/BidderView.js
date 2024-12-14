import React, { useState } from "react";
import auction from "../utils/auction";

const BidderView = () => {
  const [bid, setBid] = useState({ walletAddress: "", amount: "" });
  const [message, setMessage] = useState("");

  const handlePlaceBid = () => {
    try {
      const result = auction.placeBid(bid.walletAddress, parseFloat(bid.amount));
      setMessage(result.message);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div>
      <h2>Bidder View</h2>
      <input
        type="text"
        placeholder="Wallet Address"
        value={bid.walletAddress}
        onChange={(e) => setBid({ ...bid, walletAddress: e.target.value })}
      />
      <input
        type="number"
        placeholder="Bid Amount"
        value={bid.amount}
        onChange={(e) => setBid({ ...bid, amount: e.target.value })}
      />
      <button onClick={handlePlaceBid}>Place Bid</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default BidderView;
