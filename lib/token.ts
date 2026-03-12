const CNDL_MINT = "9dXSV8VWuYvGfTzqvkBeoFwH9ihVTybDuWo5VaJPCNDL";
const HELIUS_RPC = (key: string) => `https://mainnet.helius-rpc.com/?api-key=${key}`;

async function rpc(key: string, method: string, params: unknown) {
  const res = await fetch(HELIUS_RPC(key), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: "1", method, params }),
    next: { revalidate: 120 },
  });
  const data = await res.json();
  return data?.result ?? null;
}

export async function fetchTokenData() {
  const heliusKey = process.env.HELIUS_API_KEY;
  if (!heliusKey) return null;

  try {
    const [supplyResult, topHoldersResult, priceRes, holderRes] = await Promise.all([
      rpc(heliusKey, "getTokenSupply", [CNDL_MINT]),
      rpc(heliusKey, "getTokenLargestAccounts", [CNDL_MINT]),
      // DexScreener — free, no key, works for any Solana token
      fetch(`https://api.dexscreener.com/latest/dex/tokens/${CNDL_MINT}`, {
        next: { revalidate: 60 },
      }),
      // Helius token accounts for holder count
      fetch(HELIUS_RPC(heliusKey), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0", id: "2",
          method: "getTokenAccounts",
          params: { mint: CNDL_MINT, limit: 1, options: { showZeroBalance: false } },
        }),
        next: { revalidate: 300 },
      }),
    ]);

    const priceData = await priceRes.json();
    const holderData = await holderRes.json();

    const decimals = supplyResult?.value?.decimals ?? 0;
    const supply = supplyResult?.value?.uiAmount ?? null;
    const topHolders = topHoldersResult?.value ?? [];
    const holderCount = holderData?.result?.total ?? null;

    // DexScreener: pick the pair with highest liquidity
    const pairs: { priceUsd?: string; liquidity?: { usd?: number } }[] = priceData?.pairs ?? [];
    const bestPair = pairs.sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
    const price = bestPair?.priceUsd ? parseFloat(bestPair.priceUsd) : null;

    return { mint: CNDL_MINT, supply, decimals, price, holderCount, topHolders: topHolders.slice(0, 10) };
  } catch {
    return null;
  }
}
