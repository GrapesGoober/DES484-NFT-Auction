// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Auction {
    address payable public seller;
    uint public endTime;
    address public highestBidder;
    uint public highestBid;
    IERC721 public nft;
    uint public nftId;

    event BidPlaced(address indexed bidder, uint amount);
    event AuctionEnded(address indexed winner, uint amount);

    constructor(IERC721 _nft, uint _nftId, uint _endTime) {
        // assume seller is the owner of nft
        seller = payable(msg.sender);
        // transfer NFT from original owner (seller) to contract
        nft.transferFrom(payable(seller), payable(this), nftId);
        // initialize some variables
        nft = _nft;
        nftId = _nftId;
        endTime = _endTime;
    }

    // this contract will take away money upon bid
    // will either pay this value to seller, or return to bidder
    receive() external payable {}

    function placeBid() external payable {

        // check that auction is running and value is high enough
        require(block.timestamp < endTime, "Auction has ended");
        require(msg.value > highestBid, "Bid must be higher than the current highest bid");

        // Refund the previous highest bidder, if exists
        if (highestBidder != address(0)) {
            payable(highestBidder).transfer(highestBid);
        }

        // Update the current highest bidder
        highestBidder = msg.sender;
        highestBid = msg.value;
        
        emit BidPlaced(msg.sender, msg.value);
    }

    function EndAuction() external {

        // check that the auction still running
        require(block.timestamp >= endTime, "Auction has not ended yet");
        // only the winning bidder can receive rewards
        require(msg.sender == highestBidder, "Only the highest bidder can claim the prize");
        // start the transaction; exchange NFT to bidder and ETH to seller
        nft.transferFrom(payable(this), highestBidder, nftId);
        payable(seller).transfer(highestBid);

        emit AuctionEnded(msg.sender, highestBid);
    }
}