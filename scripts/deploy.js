import pkg from "hardhat";
import fs from "fs";

const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  // 1. Deploy Token
  const TokenFactory = await ethers.getContractFactory("FaucetToken");
  const token = await TokenFactory.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("Token deployed:", tokenAddress);

  // 2. Deploy Faucet
  const FaucetFactory = await ethers.getContractFactory("TokenFaucet");
  const faucet = await FaucetFactory.deploy(tokenAddress);
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();
  console.log("Faucet deployed:", faucetAddress);

  // 3. Link faucet to token
  const tx = await token.setFaucet(faucetAddress);
  await tx.wait();
  console.log("Faucet registered with token");

  // 4. Save for frontend
  fs.writeFileSync(
    "./frontend/.env",
    `VITE_RPC_URL=${process.env.VITE_RPC_URL}
VITE_TOKEN_ADDRESS=${tokenAddress}
VITE_FAUCET_ADDRESS=${faucetAddress}
`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
