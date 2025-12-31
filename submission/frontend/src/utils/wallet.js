export async function connectWallet() {
  if (!window.ethereum) throw new Error("No wallet detected");

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  return accounts[0];
}

export function onAccountChange(callback) {
  if (!window.ethereum) return;
  window.ethereum.on("accountsChanged", callback);
}
