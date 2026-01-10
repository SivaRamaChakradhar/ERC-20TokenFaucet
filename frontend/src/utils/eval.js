import {
  getProvider,
  getRpcProvider,
  getTokenContract,
  getFaucetContract,
} from "./contracts";
import { connectWallet } from "./wallet";

function formatError(err) {
  const msg = err?.reason || err?.data?.message || err?.message || "Operation failed";
  return new Error(msg);
}

window.__EVAL__ = {
  connectWallet: async () => {
    try {
      const addr = await connectWallet();
      return String(addr);
    } catch (err) {
      throw formatError(err);
    }
  },

  requestTokens: async () => {
    try {
      const provider = await getProvider();
      const signer = await provider.getSigner();
      const faucet = await getFaucetContract(signer);

      const tx = await faucet.requestTokens();
      await tx.wait();
      return String(tx.hash);
    } catch (err) {
      throw formatError(err);
    }
  },

  getBalance: async (address) => {
    try {
      const rpc = getRpcProvider();
      const token = await getTokenContract(rpc);
      const bal = await token.balanceOf(address);
      return bal.toString();
    } catch (err) {
      throw formatError(err);
    }
  },

  canClaim: async (address) => {
    try {
      const rpc = getRpcProvider();
      const faucet = await getFaucetContract(rpc);
      return await faucet.canClaim(address);
    } catch (err) {
      throw formatError(err);
    }
  },

  getRemainingAllowance: async (address) => {
    try {
      const rpc = getRpcProvider();
      const faucet = await getFaucetContract(rpc);
      const amt = await faucet.remainingAllowance(address);
      return amt.toString();
    } catch (err) {
      throw formatError(err);
    }
  },

  getContractAddresses: async () => {
    try {
      return {
        token: import.meta.env.VITE_TOKEN_ADDRESS,
        faucet: import.meta.env.VITE_FAUCET_ADDRESS,
      };
    } catch (err) {
      throw formatError(err);
    }
  },
};
