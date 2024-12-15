// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract AuctionDutch is ERC721Holder {
    address payable public seller;
    uint public startTime;
    uint public endTime;
    uint public startingPrice;
    uint public decrementPerSec;
    IERC721 public nft;
    uint public nftId;
    bool public isActive;
    address public buyer;

    event AuctionStarted();
    event AuctionEnded(address indexed buyer);

    // creates a new auction, the msg.sender becomes 'seller'
    constructor(
        IERC721 _nft,
        uint _nftId,
        uint _startTime,
        uint _endTime,
        uint _startingPrice,
        uint _decrementPerSec
    ) {
        nft = _nft;
        nftId = _nftId;
        startTime = _startTime;
        endTime = _endTime;
        startingPrice = _startingPrice;
        decrementPerSec = _decrementPerSec;
        seller = payable(msg.sender);
        isActive = false;
    }

    // receiver to get paid and lock funds (escrow)
    receive() external payable {}

    // seller starts auction
    function startAuction() external {
        require(msg.sender == seller, "Only the seller can start the auction");
        require(!isActive, "Auction is already active");
        require(nft.ownerOf(nftId) == seller, "Seller does not own the NFT");
        require(startTime >= block.timestamp, "Start time must be in the future");
        require(endTime > startTime, "End time must be after start time");

        nft.safeTransferFrom(seller, address(this), nftId);
        isActive = true;

        emit AuctionStarted();
    }

    // anyone can buy the NFT at the current price
    function buyNFT() external payable {
        require(isActive, "Auction is not active");
        require(block.timestamp >= startTime, "Auction has not started");
        require(block.timestamp <= endTime, "Auction has ended");

        uint currentPrice = calculateCurrentPrice();
        require(msg.value >= currentPrice, "Insufficient funds");

        buyer = msg.sender;
        nft.transferFrom(address(this), buyer, nftId);
        seller.transfer(msg.value);

        isActive = false;

        emit AuctionEnded(buyer);
    }

    // calculate the current price based on time elapsed
    function calculateCurrentPrice() public view returns (uint) {
        uint timeElapsed = block.timestamp - startTime;
        uint priceReduction = timeElapsed * decrementPerSec;
        uint currentPrice = startingPrice - priceReduction;

        // ensure price doesn't fall below zero
        return currentPrice > 0 ? currentPrice : 0;
    }
}