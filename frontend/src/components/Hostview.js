import React, { useState } from "react";
import auction from "../utils/auction";

const HostView = () => {
  const [auctionDetails, setAuctionDetails] = useState({
    auctionType: "",
    tokenId: "",
    startingPrice: "",
    endingPrice: "",
    duration: "",
    endTime: "",
    minimumBid: "",
    bidDeadline: "",
  });
  const [message, setMessage] = useState("");

  const handleCreateAuction = () => {
    try {
      if (!auctionDetails.auctionType) {
        throw new Error("Please select an auction type.");
      }
      // Process auction creation logic based on auctionDetails
      setMessage(`Auction of type ${auctionDetails.auctionType} created successfully!`);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="App-container">
      <div className="App-content">
        <h2>Host View</h2>

        {/* Dropdown to select auction type */}
        <div>
          <label>
            Select Auction Type:
            <select
              value={auctionDetails.auctionType}
              onChange={(e) =>
                setAuctionDetails({
                  ...auctionDetails,
                  auctionType: e.target.value,
                })
              }
              style={{ marginLeft: "10px" }}
            >
              <option value="">--Select--</option>
              <option value="English">English Auction</option>
              <option value="Dutch">Dutch Auction</option>
              <option value="Seal Bid">Seal Bid Auction</option>
            </select>
          </label>
        </div>

        {/* Inputs for English Auction */}
        {auctionDetails.auctionType === "English" && (
          <div style={{ marginTop: "20px" }}>
            <input
              type="text"
              placeholder="NFT Token ID"
              value={auctionDetails.tokenId}
              onChange={(e) =>
                setAuctionDetails({ ...auctionDetails, tokenId: e.target.value })
              }
              style={{ marginRight: "10px" }}
            />
            <input
              type="number"
              placeholder="Starting Price"
              value={auctionDetails.startingPrice}
              onChange={(e) =>
                setAuctionDetails({ ...auctionDetails, startingPrice: e.target.value })
              }
              style={{ marginRight: "10px" }}
            />
            <input
              type="datetime-local"
              placeholder="End Time"
              value={auctionDetails.endTime}
              onChange={(e) =>
                setAuctionDetails({ ...auctionDetails, endTime: e.target.value })
              }
            />
          </div>
        )}

        {/* Inputs for Dutch Auction */}
        {auctionDetails.auctionType === "Dutch" && (
          <div style={{ marginTop: "20px" }}>
            <input
              type="text"
              placeholder="NFT Token ID"
              value={auctionDetails.tokenId}
              onChange={(e) =>
                setAuctionDetails({ ...auctionDetails, tokenId: e.target.value })
              }
              style={{ marginRight: "10px" }}
            />
            <input
              type="number"
              placeholder="Starting Price"
              value={auctionDetails.startingPrice}
              onChange={(e) =>
                setAuctionDetails({ ...auctionDetails, startingPrice: e.target.value })
              }
              style={{ marginRight: "10px" }}
            />
            <input
              type="number"
              placeholder="Ending Price"
              value={auctionDetails.endingPrice}
              onChange={(e) =>
                setAuctionDetails({ ...auctionDetails, endingPrice: e.target.value })
              }
              style={{ marginRight: "10px" }}
            />
            <input
              type="number"
              placeholder="Duration (in hours)"
              value={auctionDetails.duration}
              onChange={(e) =>
                setAuctionDetails({ ...auctionDetails, duration: e.target.value })
              }
            />
          </div>
        )}

        {/* Inputs for Seal Bid Auction */}
        {auctionDetails.auctionType === "Seal Bid" && (
          <div style={{ marginTop: "20px" }}>
            <input
              type="text"
              placeholder="NFT Token ID"
              value={auctionDetails.tokenId}
              onChange={(e) =>
                setAuctionDetails({ ...auctionDetails, tokenId: e.target.value })
              }
              style={{ marginRight: "10px" }}
            />
            <input
              type="number"
              placeholder="Minimum Bid"
              value={auctionDetails.minimumBid}
              onChange={(e) =>
                setAuctionDetails({ ...auctionDetails, minimumBid: e.target.value })
              }
              style={{ marginRight: "10px" }}
            />
            <input
              type="datetime-local"
              placeholder="Bid Deadline"
              value={auctionDetails.bidDeadline}
              onChange={(e) =>
                setAuctionDetails({ ...auctionDetails, bidDeadline: e.target.value })
              }
            />
          </div>
        )}

        {/* Create Auction Button */}
        <div style={{ marginTop: "20px" }}>
          <button className="button-link" onClick={handleCreateAuction}>
            Create Auction
          </button>
        </div>

        {/* Message Display */}
        {message && <p style={{ marginTop: "20px" }}>{message}</p>}
      </div>
    </div>
  );
};

export default HostView;

