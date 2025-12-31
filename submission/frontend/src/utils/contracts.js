import { ethers } from "ethers";

// ABI for Token
export const tokenAbi = [
  "function balanceOf(address) view returns (uint256)"
];

// ABI for Faucet
export const faucetAbi = [
  "function requestTokens()",
  "function canClaim(address) view returns (bool)",
  "function remainingAllowance(address) view returns (uint256)",
  "function lastClaimAt(address) view returns (uint256)",
  "function isPaused() view returns (bool)"
];

const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS;
const FAUCET_ADDRESS = import.meta.env.VITE_FAUCET_ADDRESS;
const RPC_URL = import.meta.env.VITE_RPC_URL;

export function getProvider() {
  return new ethers.BrowserProvider(window.ethereum);
}

export function getRpcProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

export async function getSigner() {
  const provider = await getProvider();
  return await provider.getSigner();
}

export async function getTokenContract(signerOrProvider) {
  return new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signerOrProvider);
}

export async function getFaucetContract(signerOrProvider) {
  return new ethers.Contract(FAUCET_ADDRESS, faucetAbi, signerOrProvider);
}
