import * as fs from "fs";
import * as path from "path";
import * as child_process from "child_process";
import { performance } from "perf_hooks";

// Define the regex pattern to match private keys
const pattern = /\b(0x)?[0-9a-fA-F]{64}\b/;
let results;

// Execute ripgrep to find all files matching the pattern
// and return the results as a string
try {
  const start = performance.now();
  // Check if the input path starts with a drive letter
  const inputPath = process.argv[2];
  // const isDriveLetter = /^[a-zA-Z]:/.test(inputPath);

  // Return fully resolved path to console
  console.log(`Searching for private keys in: ${path.resolve(inputPath)}`);

  // Construct the command to execute
  const command = `rg --ignore-file .rgignore --ignore-case --only-matching --multiline -Tphp -Tpdf -Tsql "${pattern}" "${inputPath}"`;

  // Execute the command
  // const results = child_process.execSync(command, { encoding: "utf-8" });
  // Execute the command and read the results as a stream
  const rg = child_process.spawn(command, { shell: true });
  rg.stdout.on("data", (data) => (results += data.toString()));

  const end = performance.now();
  // output execution time in HH:MM:SS:MS format
  const time = new Date(end - start).toISOString().substring(11, 23);
  console.log(`Search time: ${time}`);
} catch (error) {
  // If an error occurs, log it and exit
  // You may need to install ripgrep
  // https://github.com/BurntSushi/ripgrep
  // It's faster than grep and supports multiline search
  console.error("Error occurred while executing rg command:", error);
  process.exit(1);
}

if (!results) {
  console.log("No results found");
  process.exit(0);
}

// Parse the results by line and split the file path and private key

const parsed_results = results
  .split("\n")
  .filter((line) => line.includes(":"))
  .map((line) => {
    const [file_path, pk] = line.split(":").map((s) => s.trim());
    if (!file_path || !pk) return null;
    return {
      file: path.resolve(file_path),
      pk,
    };
  })
  .filter((result) => result !== null);

// Create date string for output filenames
const date = new Date();
const dateString = date.toJSON().slice(0, 10);
const timeString = date
  .toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
  .replace(/:/g, "");

const filename = path.join(
  process.cwd(),
  "PRIVATE",
  `keys_${dateString}_${timeString}`
);

const csv_file = `${filename}.csv`;
const json_file = `${filename}.json`;

fs.writeFileSync(csv_file, "file,pk\n");
for (const result of parsed_results) {
  fs.appendFileSync(csv_file, `${result.file},${result.pk}\n`);
}

console.log(`Results saved to: ${csv_file}`);

// Save the results to a JSON file
const output_json = JSON.stringify(parsed_results, null, 2);

fs.writeFileSync(json_file, output_json);
console.log(`Results saved to: ${json_file}`);
