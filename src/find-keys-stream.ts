import * as fs from "fs";
import * as path from "path";
import * as child_process from "child_process";
import { performance } from "perf_hooks";
import * as ethers from "ethers";

// Set the Alchemy API
// const alchKey = "";
// const provider = new ethers.providers.AlchemyProvider("mainnet", alchKey);

// Set the Infura API
const infuraKey = "";
const provider = new ethers.providers.InfuraProvider("mainnet", infuraKey);

// Define the regex pattern to match private keys
const pattern = "\\b(0x)?[0-9a-fA-F]{64}\\b";

// Check if the private key is valid and, if true, return the address, balance, and nonce
async function testPrivateKey(privateKey: string) {
  // Format the private key
  if (privateKey.length === 64) {
    privateKey = "0x" + privateKey;
  }
  if (!ethers.utils.isHexString(privateKey, 32)) {
    return null;
  }
  if (parseInt(privateKey, 16) === 0) {
    console.log("Private key is zero");
    return null;
  }

  try {
    // Create a signer from the private key
    const signer = new ethers.Wallet(privateKey);

    // Get the balance and nonce for the address
    const balance = await provider.getBalance(signer.address);
    const nonce = await provider.getTransactionCount(signer.address);

    // Return an object with the address, balance, and nonce
    return {
      address: ethers.utils.getAddress(signer.address),
      balance: balance,
      nonce: nonce,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

(async () => {
  // Execute ripgrep to find all files matching the pattern
  // and return the results as a stream
  try {
    const start = performance.now();

    let fullPath = process.argv[2];
    if (!path.isAbsolute(fullPath)) {
      fullPath = path.join(process.cwd(), fullPath);
    }

    console.log(`Searching for private keys in: ${fullPath}`);
    const command = `rg --ignore-file .rgignore --ignore-case --only-matching --multiline -Tphp -Tpdf -Tsql "${pattern}" "${fullPath}"`;

    console.log(`Command: ${command}`);
    // Execute the command and read the results as a stream
    const rg = child_process.spawn(command, { shell: true });

    // Create an array to hold all the promises returned by testPrivateKey
    const promises = [];

    rg.stdout.on("data", (data) => {
      const lines = data.toString().trim().split(/\r?\n/);
      for (const line of lines) {
        const [file_path, pk] = line
          .toString()
          .trim()
          .split(/:(?!.*:)/)
          .map((s) => s);

        const keyData = {
          file_path,
          pk: pk.toLowerCase(),
        };

        // // Check if the private key is valid and print the result
        // promises.push(
        testPrivateKey(pk).then((result) => {
          if (result) {
            console.log(`Private key found in file ${file_path}:`);
            console.log(result);
          }
        });
      }
    });

    rg.on("close", async () => {
      // Wait for all promises to resolve and log the final output
      // const results = await Promise.all(promises);
      // console.log("All promises resolved: ", results);
      const end = performance.now();
      // output execution time in HH:MM:SS:MS format
      const time = new Date(end - start).toISOString().substring(11, 23);
      console.log(`Search time: ${time}`);
    });
  } catch (e) {
    console.log(`Error: ${e.message}`);
    process.exit(1);
  }
})();
