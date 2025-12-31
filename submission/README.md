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

> ✨ Replace with your real contract links.

**Token (FaucetToken)**  
`<YOUR_TOKEN_ADDRESS>`  
Etherscan: https://sepolia.etherscan.io/address/<YOUR_TOKEN_ADDRESS>

**Faucet (TokenFaucet)**  
`<YOUR_FAUCET_ADDRESS>`  
Etherscan: https://sepolia.etherscan.io/address/<YOUR_FAUCET_ADDRESS>

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