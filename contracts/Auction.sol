// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract Auction is ERC721Holder {
    address payable public seller;
    uint public endTime;
    address public highestBidder;
    uint public highestBid;
    IERC721 public nft;
    uint public nftId;
    bool public auctionStarted;

    event AuctionStarted();
    event BidPlaced(address indexed bidder, uint amount);
    event AuctionEnded(address indexed winner, uint amount);

    constructor(IERC721 _nft, uint _nftId, uint _endTime) {
        nft = _nft;
        nftId = _nftId;
        endTime = _endTime;
        seller = payable(msg.sender);
        auctionStarted = false;
    }

    receive() external payable {}

    function startAuction() external {
        require(msg.sender == seller, "Only the seller can start the auction");
        require(!auctionStarted, "Auction has already started");
        require(nft.ownerOf(nftId) == seller, "Seller does not own the NFT");

        nft.safeTransferFrom(seller, address(this), nftId);
        auctionStarted = true;

        emit AuctionStarted();
    }

    function placeBid() external payable {
        require(auctionStarted, "Auction has not started");
        require(block.timestamp < endTime, "Auction has ended");
        require(msg.value > highestBid, "Bid must be higher than the current highest bid");

        if (highestBidder != address(0)) {
            payable(highestBidder).transfer(highestBid);
        }

        highestBidder = msg.sender;
        highestBid = msg.value;

        emit BidPlaced(msg.sender, msg.value);
    }

    function EndAuction() external {
        require(auctionStarted, "Auction has not started");
        require(block.timestamp >= endTime, "Auction has not ended yet");

        if (highestBidder != address(0)) {
            nft.transferFrom(address(this), highestBidder, nftId);
            seller.transfer(highestBid);
        } else {
            nft.transferFrom(address(this), seller, nftId);
        }

        emit AuctionEnded(highestBidder, highestBid);
    }
}
