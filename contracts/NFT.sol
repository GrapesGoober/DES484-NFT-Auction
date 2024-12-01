// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721, Ownable {
    uint256 public tokenCounter;

    constructor() ERC721("NFTMarketplace", "NFTM") {
        tokenCounter = 0;
    }

    function mintNFT(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
        uint256 tokenId = tokenCounter;
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);
        tokenCounter++;
        return tokenId;
    }
}
