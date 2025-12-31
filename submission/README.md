# 🚀 Web3 Token Faucet DApp (ERC-20 + Cooldown + Lifetime Limits)

This project is a production-ready **decentralized faucet system** demonstrating real-world Web3 engineering:

✔ ERC-20 token  
✔ On-chain rate limits  
✔ Wallet connection (EIP-1193)  
✔ Real-time UI sync  
✔ Verified contracts on testnet  
✔ Dockerized frontend  
✔ Health endpoint + evaluation API

It enforces business rules **fully on-chain** with no centralized trust:

- 24-hour cooldown
- Per-address lifetime limit
- Faucet pause/unpause admin control
- Safe, gas-efficient minting
- Transparent event logs

---

## 🏗 Architecture Overview

**High-level flow**

1. User connects wallet (MetaMask)
2. UI queries token + faucet state
3. User requests tokens
4. Faucet validates cooldown + limits
5. Tokens are minted and sent
6. UI updates automatically

User Wallet → Faucet Contract → Token Contract
│ │ │
└──────────────┴────────────────┘
Frontend (React + ethers)


## 🔗 Deployed Contracts (Sepolia)

**Token (FaucetToken)**  
`<YOUR_TOKEN_ADDRESS>`  
Etherscan: https://sepolia.etherscan.io/address/0xcd7184199F7f614F09C40dfaD5d2b383723597aE

**Faucet (TokenFaucet)**  
`<YOUR_FAUCET_ADDRESS>`  
Etherscan: https://sepolia.etherscan.io/address/0x77fAC3F0EA4eFEB1D0e44F5F026AA9E156e7aC24

Both contracts are verified.

---

## 📂 Project Structure

submission/
├── contracts/
│ ├── Token.sol
│ ├── TokenFaucet.sol
│ └── test/
├── scripts/
│ └── deploy.js
├── frontend/
│ ├── src/
│ ├── Dockerfile
│ └── nginx.conf
├── docker-compose.yml
├── hardhat.config.js
├── .env.example
└── README.md

yaml
Copy code

---

## ⚙️ Requirements

- Node 18+
- Docker Desktop
- MetaMask
- Sepolia test ETH

---

## 🚧 Local Development (without Docker)

### Install dependencies

```bash
npm install

npx hardhat compile

npx hardhat run scripts/deploy.js --network sepolia

## .env.example file
SEPOLIA_RPC=
PRIVATE_KEY=
ETHERSCAN_KEY=
VITE_RPC_URL=
VITE_TOKEN_ADDRESS=
VITE_FAUCET_ADDRESS=

## Frontend
cd frontend
npm install
npm run dev

-server runs at
http://localhost:5173

## Docker Deployment

docker compose up

App available at
http://localhost:3000

Health endpoint:

http://localhost:3000/health

Must return:

OK
http://localhost:5173
