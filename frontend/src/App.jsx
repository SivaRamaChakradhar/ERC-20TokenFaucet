import { useEffect, useMemo, useState } from "react";
import { connectWallet, onAccountChange, onChainChange } from "./utils/wallet";
import {
  getProvider,
  getRpcProvider,
  getTokenContract,
  getFaucetContract,
} from "./utils/contracts";

const POLL_MS = 120_000; // 2 min polling to reduce RPC load

function formatWei(wei, decimals = 18) {
  if (!wei) return "0";
  const str = wei.toString().padStart(decimals + 1, "0");
  const intPart = str.slice(0, -decimals) || "0";
  const fracPart = str.slice(-decimals).replace(/0+$/, "");
  return fracPart ? `${intPart}.${fracPart}` : intPart;
}

function formatError(err) {
  return err?.reason || err?.data?.message || err?.message || "Something went wrong";
}

function formatCountdown(seconds) {
  if (seconds <= 0) return "Ready";
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function App() {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState("0");
  const [canClaim, setCanClaim] = useState(false);
  const [remaining, setRemaining] = useState("0");
  const [paused, setPaused] = useState(false);
  const [lastClaim, setLastClaim] = useState(0);
  const [cooldown, setCooldown] = useState(24 * 60 * 60);
  const [faucetAmount, setFaucetAmount] = useState("0");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const nowSeconds = useMemo(() => Math.floor(Date.now() / 1000), []);
  const [tick, setTick] = useState(nowSeconds);

  const readyAt = lastClaim > 0 ? lastClaim + cooldown : 0;
  const timeLeft = Math.max(0, readyAt - tick);

  async function loadData(addr, showStatus = false) {
    if (!addr) return;
    if (showStatus) setStatus("Refreshing...");
    setError("");

    try {
      const rpc = getRpcProvider();
      const token = await getTokenContract(rpc);
      const faucet = await getFaucetContract(rpc);

      const results = await Promise.allSettled([
        token.balanceOf(addr),
        faucet.canClaim(addr),
        faucet.remainingAllowance(addr),
        faucet.lastClaimAt(addr),
        faucet.isPaused(),
        faucet.COOLDOWN_TIME(),
        faucet.FAUCET_AMOUNT(),
      ]);

      // Only update values that succeeded; keep old values for failed calls
      if (results[0].status === "fulfilled") setBalance(formatWei(results[0].value));
      if (results[1].status === "fulfilled") setCanClaim(Boolean(results[1].value));
      if (results[2].status === "fulfilled") setRemaining(formatWei(results[2].value));
      if (results[3].status === "fulfilled") setLastClaim(Number(results[3].value));
      if (results[4].status === "fulfilled") setPaused(Boolean(results[4].value));
      if (results[5].status === "fulfilled") setCooldown(Number(results[5].value));
      if (results[6].status === "fulfilled") setFaucetAmount(formatWei(results[6].value));

      // Show error only if majority of calls failed
      const failedCount = results.filter((r) => r.status === "rejected").length;
      if (failedCount > 3) {
        setError("RPC endpoint overloaded - data may be stale");
      }
    } catch (e) {
      setError(formatError(e));
    } finally {
      setStatus("");
    }
  }

  async function connect() {
    try {
      setStatus("Connecting wallet...");
      const addr = await connectWallet();
      setAddress(addr);
      await loadData(addr, true);
    } catch (e) {
      setError(formatError(e));
    } finally {
      setStatus("");
    }
  }

  async function claim() {
    try {
      setLoading(true);
      setError("");
      setStatus("Sending transaction...");

      const provider = await getProvider();
      const signer = await provider.getSigner();
      const faucet = await getFaucetContract(signer);

      const tx = await faucet.requestTokens();
      setStatus("Waiting for confirmation...");
      await tx.wait();

      setStatus("Claim successful");
      await loadData(address, true);
    } catch (err) {
      console.error(err);
      setError(formatError(err));
      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const accountHandler = (accounts) => {
      const next = accounts?.[0];
      setAddress(next || null);
      setBalance("0");
      setRemaining("0");
      setCanClaim(false);
      setLastClaim(0);
      if (next) loadData(next, true);
    };

    onAccountChange(accountHandler);
    onChainChange(() => {
      if (address) loadData(address, true);
    });
  }, [address]);

  useEffect(() => {
    if (!address) return;
    // Only update local tick for countdown, avoid RPC calls during cooldown
    const id = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!address) return;
    // Load data once at start, then only after cooldown expires
    loadData(address);
    const id = setInterval(() => {
      if (timeLeft <= 0) {
        loadData(address);
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [address, timeLeft]);

  const disabled =
    loading || paused || timeLeft > 0 || !address || remaining === "0";

  return (
    <div style={{ padding: 20, maxWidth: 720 }}>
      <h1>Token Faucet</h1>

      {!address ? (
        <button onClick={connect}>Connect Wallet</button>
      ) : (
        <>
          <p>Connected: {address}</p>
          <p>Balance: {balance}</p>
          <p>Remaining Allowance: {remaining}</p>
          <p>Faucet Amount per claim: {faucetAmount}</p>
          <p>Pause status: {paused ? "Paused" : "Active"}</p>
          <p>Cooldown: {formatCountdown(timeLeft)}</p>

          <button disabled={disabled} onClick={claim}>
            {loading ? "Processing..." : "Request Tokens"}
          </button>

          {status && <p>{status}</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </>
      )}
    </div>
  );
}

export default App;
