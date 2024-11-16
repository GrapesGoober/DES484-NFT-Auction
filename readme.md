# DES484 NFT Auction Project
# Read me

### 1. Run the test
  - Command: _**truffle test**_
  - If this error occurs "Something went wrong while attempting to connect to the network at http://127.0.0.1:8545. Check your network configuration.
CONNECTION ERROR: Couldn't connect to node http://127.0.0.1:8545.", COMMENT the below part in truffle-config.js
```
    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 8545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },
```

### 2. Set up truffle config and deploy to the local test ganache blockchain
  - Note that we use 2 terminals at the same time
  - Configure truffle: uncomment development part in truffle-config.js
```
    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 8545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },
```
  - Install ganache CLI: _**npm install -g ganache-cli**_
  - ### Terminal1: Start ganache CLI: _**ganache-cli**_
  - ### Terminal2 run
      - _**truffle migrate**_
      - _**truffle console**_
      - use javascript to interact with smart contract. Example:
        - reference the smart contract: _**VendingMachine.deployed().then((x) => {contract = x})**_
        - use that contract instance: _**contract.getVendingMachineBalance().then((b) => {bal = b})**_
        - call bal: _**bal**_
        - make bal a normal string: _**bal.toString()**_

## Members
- 6422770774 Nachat Kaewmeesang
- 6422781326 Panisara Srisan 
- 6422790046 Praewaphun Sukmark
- 6422770337 Krongthong Surin
