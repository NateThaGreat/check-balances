const { ethers } = require("ethers");

const apiKey = "";

// Initialize the provider URLs and API keys
const chains = [
  {
    name: "Ethereum",
    chainId: 1,
    rpcUrl: "https://mainnet.infura.io/v3/",
  },
  {
    name: "Polygon",
    chainId: 137,
    rpcUrl:
      "https://polygon-mainnet.infura.io/v3/",
  },
  {
    name: "Optimism",
    chainId: 10,
    rpcUrl:
      "https://optimism-mainnet.infura.io/v3/",
  },
  {
    name: "Arbitrum",
    chainId: 42161,
    rpcUrl:
      "https://arbitrum-mainnet.infura.io/v3/",
  },
  {
    name: "Palm",
    chainId: 11297108109,
    rpcUrl:
      "https://palm-mainnet.infura.io/v3/",
  },
  {
    name: "Avalanche C-Chain",
    chainId: 43114,
    rpcUrl:
      "https://avalanche-mainnet.infura.io/v3/",
  },
  {
    name: "NEAR",
    chainId: "near",
    rpcUrl:
      "https://near-mainnet.infura.io/v3/",
  }
  {
    name: "Aurora",
    chainId: 1313161554,
    rpcUrl:
      "https://aurora-mainnet.infura.io/v3/",
  },
  {
    name: "Starknet",
    chainId: 1,
    rpcUrl:
      "https://starknet-mainnet.infura.io/v3/",
  },
  {
    name: "Celo",
    chainId: 42220,
    rpcUrl:
      "https://celo-mainnet.infura.io/v3/",
  },
  {
    name: "Linea",
    chainId: 5,
    rpcUrl:
      "https://consensys-zkevm-goerli-prealpha.infura.io/v3/",
  },
];

// Define the address to check balances for
const address = "";

async function main() {
  // Loop through each chain
  for (let i = 0; i < chains.length; i++) {
    const chain = chains[i];
    console.log(`Chain: ${chain.name}`);

    // Initialize the provider and get the balance
    const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl + apiKey);
    const balance = await provider.getBalance(address);

    console.log(`Balance: ${ethers.utils.formatEther(balance)} ETH`);
    console.log("----------------------");
  }
}

main();
