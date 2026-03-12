const CNDL_MINT = "9dXSV8VWuYvGfTzqvkBeoFwH9ihVTybDuWo5VaJPCNDL";

export async function fetchTokenData() {
  const heliusKey = process.env.HELIUS_API_KEY;
  if (!heliusKey) return null;

  try {
    const [assetRes, holdersRes, priceRes, holderCountRes] = await Promise.all([
      fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: "1", method: "getAsset", params: { id: CNDL_MINT } }),
        next: { revalidate: 300 },
      }),
      fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: "2", method: "getTokenLargestAccounts", params: [CNDL_MINT] }),
        next: { revalidate: 300 },
      }),
      fetch(`https://price.jup.ag/v6/price?ids=${CNDL_MINT}`, { next: { revalidate: 60 } }),
      fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0", id: "3", method: "getTokenAccounts",
          params: { mint: CNDL_MINT, limit: 1, displayOptions: { showZeroBalance: false } },
        }),
        next: { revalidate: 300 },
      }),
    ]);

    const assetData = await assetRes.json();
    const holdersData = await holdersRes.json();
    const priceData = await priceRes.json();
    const holderCountData = await holderCountRes.json();

    const supply = assetData?.result?.token_info?.supply ?? null;
    const decimals = assetData?.result?.token_info?.decimals ?? 0;
    const adjustedSupply = supply ? supply / Math.pow(10, decimals) : null;
    const price = priceData?.data?.[CNDL_MINT]?.price ?? null;
    const holderCount = holderCountData?.result?.total ?? null;
    const topHolders = holdersData?.result?.value ?? [];

    return { mint: CNDL_MINT, supply: adjustedSupply, decimals, price, holderCount, topHolders: topHolders.slice(0, 10) };
  } catch {
    return null;
  }
}
