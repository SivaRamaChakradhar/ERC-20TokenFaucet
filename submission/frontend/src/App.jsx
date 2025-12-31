import { useEffect, useState } from "react";
import { connectWallet } from "./utils/wallet";
import {
  getProvider,
  getRpcProvider,
  getTokenContract,
  getFaucetContract,
} from "./utils/contracts";

function App() {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState("0");
  const [canClaim, setCanClaim] = useState(false);
  const [remaining, setRemaining] = useState("0");
  const [cooldownEnds, setCooldownEnds] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function loadData(addr) {
    const rpc = getRpcProvider();

    const token = await getTokenContract(rpc);
    const faucet = await getFaucetContract(rpc);

    const bal = await token.balanceOf(addr);
    setBalance(bal.toString());

    const eligible = await faucet.canClaim(addr);
    setCanClaim(eligible);

    const remain = await faucet.remainingAllowance(addr);
    setRemaining(remain.toString());

    const last = await faucet.lastClaimAt(addr);
    if (Number(last) > 0) {
      setCooldownEnds(Number(last) + 24 * 60 * 60);
    }
  }

  async function connect() {
    try {
      const addr = await connectWallet();
      setAddress(addr);
      await loadData(addr);
    } catch (e) {
      alert(e.message);
    }
  }

  async function claim() {
    try {
      setLoading(true);
      setStatus("Sending transaction...");

      const provider = await getProvider();
      const signer = await provider.getSigner();
      const faucet = await getFaucetContract(signer);

      const tx = await faucet.requestTokens();
      setStatus("Waiting confirmation...");
      await tx.wait();

      setStatus("Success!");
      await loadData(address);
    } catch (err) {
      console.error(err);
      setStatus(err?.reason || err?.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Token Faucet</h1>

      {!address ? (
        <button onClick={connect}>Connect Wallet</button>
      ) : (
        <>
          <p>Connected: {address}</p>

          <p>Balance: {balance}</p>
          <p>Remaining Allowance: {remaining}</p>

          {cooldownEnds && (
            <p>
              Cooldown ends:{" "}
              {new Date(cooldownEnds * 1000).toLocaleString()}
            </p>
          )}

          <button disabled={!canClaim || loading} onClick={claim}>
            {loading ? "Processing..." : "Request Tokens"}
          </button>

          <p>{status}</p>
        </>
      )}
    </div>
  );
}

export default App;
