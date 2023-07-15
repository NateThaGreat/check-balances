#!/bin/bash

# Set the search pattern for Ethereum private keys
pattern='\b(0x)?[0-9a-fA-F]{64}\b'

# Search for the pattern in the home directory
results=$(rg --verbose --ignore-case --only-matching --multiline --glob "!/AppData/**" -Tphp -Tpdf -Tsql "$pattern" $1)

# Write the results to a CSV file
echo 'file,pk' > keys.csv
while IFS= read -r line; do
  key=$(echo "$line" | sed -E 's/:.*//')
  file=$(echo "$line" | sed -E 's/[^:]*://')
  echo "$key,$file" >> keys.csv
done <<< "$results"
