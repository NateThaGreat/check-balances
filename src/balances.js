const ethers = require('ethers');
const fs = require('fs');
const {parse, stringify} = require('csv');

// Set the Alchemy API and the input file
const alchKey = '';
const provider = new ethers.providers.AlchemyProvider('mainnet', alchKey);

// In format: 
// file,pk
// /Users/home/user/Documents/file.csv,0x0000000000000000000000000000000000000000000000000000000000000000
const keyFile = 'keys.csv';

// Check if the private key is valid and, if true, return the address, balance, and nonce 
async function testPrivateKey(privateKey) {

    // Format the private key
    if (privateKey.length === 64) {
        privateKey = "0x" + privateKey;
    }
    if (!ethers.utils.isHexString(privateKey, 32)) {
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
            nonce: nonce
        };

    } catch (error) {
        // console.log(error);
        return null;
    }
}

async function main() {

    // Setup variables
    const output = [];
    const duplicatesOutput = [];
    const pkFiles = {};
    let rowNumber = 0;
    let totalEth = ethers.BigNumber.from(0);
    
    // Read the input file
    fs.createReadStream(keyFile).pipe(parse({ columns: true }))
        .on("data", (row) => {
            
            const file = row.file;

            // Lowercase the private key from the input file
            let pk = row.pk.toLowerCase();

            // Check if the private key is valid
            testPrivateKey(pk).then((walletInfo) => {
                if (walletInfo === null) {
                    return;
                }
                // Check if the private key has already been processed
                if (pk in pkFiles) {
                    // If the private key has been processed, add the current row to the list of duplicates
                    pkFiles[pk].push(file);
                    // Set the duplicates field to true
                    duplicatesOutput.push({
                        pk: pk,
                        files: pkFiles[pk],
                        duplicates: true
                    });
                    // console.log(duplicatesOutput);
                } else {

                    if (walletInfo.balance.isZero() && walletInfo.nonce === 0) {
                        return;
                    }
                        
                    
                    totalEth = totalEth.add(walletInfo.balance);
                    
                    rowNumber++;
                    result = {
                        rowNumber: rowNumber,
                        pk: pk,
                        address: walletInfo.address,
                        balance: walletInfo.balance,
                        nonce: walletInfo.nonce,
                        file: file,
                        duplicates: false

                    }
                    // Add current pk to the list of processed private keys
                    pkFiles[pk] = [file];

                    // Add the current row to the output array
                    output.push(result);

                    // Output the current row to the console
                    console.log(result);
                }   
            });
        })
        .on("end", function () {
            // Output the complete array of data to the console
            console.log(output);
            
            // Write the output array to a file
            stringify(output, (err, outputString) => {
                if (err) {
                    console.error(err);
                } else {
                    fs.writeFileSync('keys_with_balances.csv', outputString);
                }
            });
            
            stringify(duplicatesOutput, (err, outputString) => {
                if (err) {
                    console.error(err);
                } else {
                    fs.writeFileSync('duplicates_output.csv', outputString);
                }
            });

            console.log(`Total ETH balance on all accounts: ${ethers.utils.formatEther(totalEth)}`);
        });
}

main();