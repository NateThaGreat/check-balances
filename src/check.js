// Input: array of private keys

const privateKeys = [];

const ethers = require("ethers");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// Use ethers.js to connect to provider
const infuraKey = "";
const provider = new ethers.providers.InfuraProvider("mainnet", infuraKey);

// Function to retrieve account information
const getAccountInfo = async (privateKeys) => {
  const accountInfo = [];

  // Retrieve balance and nonce for each address
  for (let i = 0; i < privateKeys.length; i++) {
    const privateKey = privateKeys[i];
    const wallet = new ethers.Wallet(privateKey);
    const address = wallet.address;

    const balance = await provider.getBalance(address);
    const nonce = await provider.getTransactionCount(address);

    const account = {
      privateKey: privateKey,
      address: address,
      balance: ethers.utils.formatEther(balance).toString(),
      nonce: nonce,
    };

    accountInfo.push(account);
  }

  return accountInfo;
};

// Call the function to retrieve account information for the private keys
getAccountInfo(privateKeys)
  .then((accountInfo) => {
    const csvWriter = createCsvWriter({
      path: "account_info.csv",
      header: [
        { id: "privateKey", title: "Private Key" },
        { id: "address", title: "Address" },
        { id: "balance", title: "Balance" },
        { id: "nonce", title: "Nonce" },
      ],
    });

    // Write the account information to the CSV file
    csvWriter
      .writeRecords(accountInfo)
      .then(() => console.log("CSV file has been written successfully."))
      .catch((error) => console.error("Error writing CSV file:", error));
    console.log(accountInfo);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
