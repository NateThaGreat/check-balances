import * as ethers from 'ethers';
import * as fs from 'fs';
import { parse, stringify } from 'csv';

export async function processKeys(keyFile: string, alchKey: string): Promise<{ outputCsv: string, duplicatesCsv: string }> {

  // Set the Alchemy API provider
  const provider = new ethers.providers.AlchemyProvider('mainnet', alchKey);

  // Setup variables
  const output: any[] = [];
  const duplicatesOutput: any[] = [];
  const pkFiles: { [key: string]: string[] } = {};
  let rowNumber = 0;
  let totalEth = ethers.BigNumber.from(0);

  // Read the input file
  await new Promise((resolve, reject) => {
    fs.createReadStream(keyFile).pipe(parse({ columns: true }))
      .on("data", async (row: { file: string, pk: string }) => {

        const file = row.file;

        // Lowercase the private key from the input file
        let pk = row.pk.toLowerCase();

        // Check if the private key is valid
        const walletInfo = await testPrivateKey(pk, provider);
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
        } else {

          if (walletInfo.balance.isZero() && walletInfo.nonce === 0) {
            return;
          }
          // Add current pk to the list of processed private keys
          pkFiles[pk] = [file];
      
          // Add the current row to the output array
          output.push(result);
      
          // Output the current row to the console
          console.log(result);
        }
      })
      .on("end", function () {
      
        // Create the output CSV file
        const outputCsv = stringify(output, {
          header: true,
          columns: [
            { key: 'rowNumber', header: 'Row Number' },
            { key: 'pk', header: 'Private Key' },
            { key: 'address', header: 'Address' },
            { key: 'balance', header: 'Balance (Wei)' },
            { key: 'nonce', header: 'Nonce' },
            { key: 'file', header: 'File' },
            { key: 'duplicates', header: 'Duplicates' }
          ]
        });
      
        // Write the output file to disk
        fs.writeFileSync('output.csv', outputCsv);
      
        // Create the duplicates output CSV file
        const duplicatesCsv = stringify(duplicatesOutput, {
          header: true,
          columns: [
            { key: 'pk', header: 'Private Key' },
            { key: 'files', header: 'Files' },
            { key: 'duplicates', header: 'Duplicates' }
          ]
        });
      
        // Write the duplicates output file to disk
        fs.writeFileSync('duplicates.csv', duplicatesCsv);
      
        console.log(`Processed ${rowNumber} rows. Total balance: ${totalEth.toString()} Wei.`);
      });
      