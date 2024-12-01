// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract EnglishAuction {
    IERC721 public nftContract;
    uint256 public nftTokenId;
    uint256 public endTime;
    address public highestBidder;
    uint256 public highestBid;

    constructor(address _nftContract, uint256 _nftTokenId, uint256 _endTime) {
        nftContract = IERC721(_nftContract);
        nftTokenId = _nftTokenId;
        endTime = _endTime;
    }

    function placeBid() external payable {

        // check that auction is running and value is high enough
        require(block.timestamp < endTime, "Auction has ended");
        require(msg.value > highestBid, "Bid must be higher than the current highest bid");

        // Refund the previous highest bidder, if exists
        if (highestBidder != address(0)) {
            (bool success,) = highestBidder.call{value: highestBid}("");
            require(success, "Refund failed");
        }

        // Update the current highest bidder
        highestBidder = msg.sender;
        highestBid = msg.value;
    }

    function claimPrize() external {
        require(block.timestamp >= endTime, "Auction has not ended yet");
        require(msg.sender == highestBidder, "Only the highest bidder can claim the prize");

        nftContract.transferFrom(address(this), msg.sender, nftTokenId);
        (bool success,) = msg.sender.call{value: highestBid}("");
        require(success, "Transfer of funds failed");
    }
}