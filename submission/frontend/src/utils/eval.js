import {
  getProvider,
  getRpcProvider,
  getTokenContract,
  getFaucetContract,
} from "./contracts";
import { connectWallet } from "./wallet";

window.__EVAL__ = {
  connectWallet: async () => {
    const addr = await connectWallet();
    return String(addr);
  },

  requestTokens: async () => {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const faucet = await getFaucetContract(signer);

    const tx = await faucet.requestTokens();
    await tx.wait();
    return String(tx.hash);
  },

  getBalance: async (address) => {
    const rpc = getRpcProvider();
    const token = await getTokenContract(rpc);
    const bal = await token.balanceOf(address);
    return bal.toString();
  },

  canClaim: async (address) => {
    const rpc = getRpcProvider();
    const faucet = await getFaucetContract(rpc);
    return await faucet.canClaim(address);
  },

  getRemainingAllowance: async (address) => {
    const rpc = getRpcProvider();
    const faucet = await getFaucetContract(rpc);
    const amt = await faucet.remainingAllowance(address);
    return amt.toString();
  },

  getContractAddresses: async () => {
    return {
      token: import.meta.env.VITE_TOKEN_ADDRESS,
      faucet: import.meta.env.VITE_FAUCET_ADDRESS,
    };
  },
};
