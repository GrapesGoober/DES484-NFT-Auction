// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract Auction is IERC721Receiver {
    address payable public seller;
    uint public endTime;
    address public highestBidder;
    uint public highestBid = 0;
    IERC721 public nft;
    uint public nftId;

    event BidPlaced(address indexed bidder, uint amount);
    event AuctionEnded(address indexed winner, uint amount);

    constructor(IERC721 _nft, uint _nftId, uint _endTime) payable {
        // initialize some variables
        nft = _nft;
        nftId = _nftId;
        endTime = _endTime;
        
        // assume seller is the owner of nft
        seller = payable(msg.sender);
        highestBidder = seller;
        // transfer NFT from original owner (seller) to contract
        require(nft.ownerOf(nftId) == seller, "Seller does not own NFT");
        // // for some reason, I can't transfer NFT to contract
        // // this throws an undecodable revert, so I cant figure out why
        // // I tried using IERC721Receiver but doesnt work
        // nft.approve(address(this), nftId);
        // nft.safeTransferFrom(msg.sender, address(this), nftId);
    }

    // this contract can lock away ETH and NFT to prevent fraud
    // the contract itself will pay/transfer the right parties
    receive() external payable {}
    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

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
        seller.transfer(highestBid);

        emit AuctionEnded(msg.sender, highestBid);
    }
}