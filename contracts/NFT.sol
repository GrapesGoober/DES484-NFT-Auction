// NFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT is ERC721 {
    uint256 public tokenCounter = 0;

    constructor() ERC721("NFTMarketplace", "NFTM") {
        tokenCounter = 0;  // Initialize tokenCounter
    }

    function mintNFT(address recipient) public returns (uint256) {
        require(recipient != address(0), "Recipient address cannot be zero address.");
        
        uint256 tokenId = tokenCounter;
        _safeMint(recipient, tokenId);
        tokenCounter++;  // Increment tokenCounter after minting
        return tokenId;
    }
}
