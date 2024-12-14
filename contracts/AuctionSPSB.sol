// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

// auction Second Price Sealed Bid (SPSB)
contract AuctionSPSB is ERC721Holder {
    address payable public seller;
    uint public endTime;
    address payable public highestBidder;
    uint private _highestBid;
    uint private _secondBid;
    IERC721 public nft;
    uint public nftId;
    bool public auctionStarted;

    event AuctionStarted();
    event BidPlaced(address indexed bidder);
    event AuctionEnded(address indexed winner, uint amount);

    // creates a new auction, the msg.sender becomes 'seller'
    constructor(IERC721 _nft, uint _nftId, uint _endTime, uint _minPrice) {
        nft = _nft;
        nftId = _nftId;
        endTime = _endTime;
        _highestBid = _minPrice;
        seller = payable(msg.sender);
        auctionStarted = false;
    }

    // receiver to get paid and lock funds (escrow)
    receive() external payable {}

    // seller starts auction
    function startAuction() external {
        require(msg.sender == seller, "Only the seller can start the auction");
        require(!auctionStarted, "Auction has already started");
        require(nft.ownerOf(nftId) == seller, "Seller does not own the NFT");

        nft.safeTransferFrom(seller, address(this), nftId);
        auctionStarted = true;

        emit AuctionStarted();
    }

    // bidder can place bids
    function placeBid() external payable {
        require(auctionStarted, "Auction has not started");
        require(block.timestamp < endTime, "Auction has ended");

        // bid too low only updates the second price
        // contract will reject and pay you back immediately
        if (msg.value <= _highestBid && msg.value >= _secondBid) {
            payable(msg.sender).transfer(msg.value);
            _secondBid = msg.value;
            emit BidPlaced(msg.sender);
        }
            
        // bid high enough and you become highest bidder
        // escrow contract model will still lock your money
        // will return the change once contract ends & paid second price
        if (msg.value > _highestBid) {
            // refund the previous bidder
            if (highestBidder != address(0)) {
                payable(highestBidder).transfer(_highestBid);
            }

            highestBidder = payable(msg.sender);
            _secondBid = _highestBid;
            _highestBid = msg.value;

            emit BidPlaced(msg.sender);
        }
    }

    // after a certain time, auction can be ended.
    // anyone can end. the logic is the same.
    function EndAuction() external {
        require(auctionStarted, "Auction has not started");
        require(block.timestamp >= endTime, "Auction has not ended yet");

        // if bidder exists, exchange NFT to bidder and ETH to seller
        // highest bidder only needs to pay second price
        if (highestBidder != address(0)) {
            nft.transferFrom(address(this), highestBidder, nftId);
            seller.transfer(_secondBid);
            highestBidder.transfer(address(this).balance);
        // otherwise return to seller
        } else {
            nft.transferFrom(address(this), seller, nftId);
        }

        emit AuctionEnded(highestBidder, _secondBid);
    }
}
