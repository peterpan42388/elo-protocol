import fs from "node:fs";
import path from "node:path";
import solc from "solc";

const contractsDir = path.resolve("contracts");
const files = fs.readdirSync(contractsDir).filter((f) => f.endsWith(".sol"));

const sources = {};
for (const file of files) {
  sources[file] = { content: fs.readFileSync(path.join(contractsDir, file), "utf8") };
}

const input = {
  language: "Solidity",
  sources,
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  let hasError = false;
  for (const error of output.errors) {
    const line = `${error.severity.toUpperCase()}: ${error.formattedMessage}`;
    console.log(line);
    if (error.severity === "error") hasError = true;
  }
  if (hasError) process.exit(1);
}

const outDir = path.resolve("artifacts", "solidity");
fs.mkdirSync(outDir, { recursive: true });

for (const [fileName, contracts] of Object.entries(output.contracts || {})) {
  for (const [contractName, data] of Object.entries(contracts)) {
    const target = path.join(outDir, `${fileName.replace(".sol", "")}.${contractName}.json`);
    fs.writeFileSync(target, JSON.stringify({ abi: data.abi, bytecode: data.evm.bytecode.object }, null, 2));
    console.log(`Wrote ${target}`);
  }
}

console.log("Solidity compile completed.");
