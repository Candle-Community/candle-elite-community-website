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
    const [supplyResult, topHoldersResult, priceRes] = await Promise.all([
      // Accurate supply + decimals
      rpc(heliusKey, "getTokenSupply", [CNDL_MINT]),
      // Top 20 holders
      rpc(heliusKey, "getTokenLargestAccounts", [CNDL_MINT]),
      // Price from Jupiter
      fetch(`https://api.jup.ag/price/v2?ids=${CNDL_MINT}`, { next: { revalidate: 60 } }),
    ]);

    const priceData = await priceRes.json();

    const decimals = supplyResult?.value?.decimals ?? 0;
    const supply = supplyResult?.value?.uiAmount ?? null;
    // Jupiter v2 returns price as a string
    const rawPrice = priceData?.data?.[CNDL_MINT]?.price;
    const price = rawPrice != null ? parseFloat(rawPrice) : null;
    const topHolders = topHoldersResult?.value ?? [];

    // Holder count via Helius getTokenAccounts (DAS)
    const holderRes = await fetch(HELIUS_RPC(heliusKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: "2",
        method: "getTokenAccounts",
        params: { mint: CNDL_MINT, limit: 1, cursor: undefined, options: { showZeroBalance: false } },
      }),
      next: { revalidate: 300 },
    });
    const holderData = await holderRes.json();
    const holderCount = holderData?.result?.total ?? null;

    return {
      mint: CNDL_MINT,
      supply,
      decimals,
      price,
      holderCount,
      topHolders: topHolders.slice(0, 10),
    };
  } catch {
    return null;
  }
}
