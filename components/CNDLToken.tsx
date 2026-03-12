type Stats = {
  totalViews: number;
  approvedPosts: number;
  members: number;
  totalCndl: string;
  cpm: number;
} | null;

type TokenData = {
  mint: string;
  supply: number | null;
  decimals: number;
  price: number | null;
  holderCount: number | null;
  topHolders: { address: string; amount: string; uiAmount: number }[];
} | null;

const nftBenefits = [
  "Ring 3 Discord access",
  "CNDL airdrop eligibility",
  "Governance voting power",
  "Revenue share pool",
  "Elite leaderboard priority",
];

const stakingTiers = [
  { tier: "Bronze", minStake: "1,000", apy: "8.5%", holders: null },
  { tier: "Silver", minStake: "10,000", apy: "12.0%", holders: null },
  { tier: "Gold", minStake: "50,000", apy: "16.5%", holders: null },
  { tier: "Diamond", minStake: "200,000", apy: "22.0%", holders: null },
];

const tierColors: Record<string, string> = {
  Bronze: "text-orange-400",
  Silver: "text-gray-300",
  Gold: "text-yellow-400",
  Diamond: "text-blue-300",
};

function formatNum(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

export default function CNDLToken({
  stats,
  cpm,
  tokenData,
}: {
  stats: Stats;
  cpm: number;
  tokenData: TokenData;
}) {
  const supply = tokenData?.supply ?? null;
  const price = tokenData?.price ?? null;
  const holderCount = tokenData?.holderCount ?? null;
  const topHolders = tokenData?.topHolders ?? [];

  const marketCap = supply && price ? supply * price : null;

  // Build wallet distribution from top holders
  const totalSupply = supply ?? 1;
  const top10Pct = topHolders.length > 0
    ? topHolders.slice(0, 10).reduce((a, h) => a + h.uiAmount, 0) / totalSupply * 100
    : null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full" />
        <h2 className="text-2xl font-bold">$CNDL Token</h2>
        <span className="ml-auto text-xs font-mono text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-3 py-1">
          $CNDL
        </span>
      </div>

      {/* Live token stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Price</p>
          <p className="text-3xl font-bold text-yellow-400">
            {price !== null ? `$${price < 0.01 ? price.toFixed(6) : price.toFixed(4)}` : "—"}
          </p>
          <p className="text-xs text-gray-600 mt-1">USD</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Market Cap</p>
          <p className="text-3xl font-bold text-green-400">
            {marketCap !== null ? `$${formatNum(marketCap)}` : "—"}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Holders</p>
          <p className="text-3xl font-bold text-white">
            {holderCount !== null ? holderCount.toLocaleString() : "—"}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Supply</p>
          <p className="text-3xl font-bold text-white">
            {supply !== null ? formatNum(supply) : "—"}
          </p>
        </div>
      </div>

      {/* Clipping stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">$CNDL Owed</p>
          <p className="text-3xl font-bold text-yellow-400">
            {stats ? parseFloat(stats.totalCndl).toLocaleString() : "—"}
          </p>
          <p className="text-xs text-gray-600 mt-1">To clipping team</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">CPM Rate</p>
          <p className="text-3xl font-bold text-green-400">{cpm}</p>
          <p className="text-xs text-gray-600 mt-1">$CNDL per 1K views</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Approved Posts</p>
          <p className="text-3xl font-bold text-white">{stats?.approvedPosts ?? "—"}</p>
          <p className="text-xs text-gray-600 mt-1">Total clipping posts</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Clippers</p>
          <p className="text-3xl font-bold text-white">{stats?.members ?? "—"}</p>
          <p className="text-xs text-gray-600 mt-1">Registered members</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Holders */}
        <div className="card p-5">
          <p className="text-sm font-semibold text-gray-300 mb-4">
            Top Holders
            {top10Pct !== null && (
              <span className="ml-2 text-xs text-gray-500 font-normal">
                Top 10 hold {top10Pct.toFixed(1)}% of supply
              </span>
            )}
          </p>
          {topHolders.length === 0 ? (
            <p className="text-sm text-gray-600">No data</p>
          ) : (
            <div className="space-y-3">
              {topHolders.slice(0, 8).map((h, i) => {
                const pct = supply ? (h.uiAmount / supply) * 100 : 0;
                return (
                  <div key={h.address}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500 font-mono text-xs">
                        #{i + 1} {h.address.slice(0, 4)}...{h.address.slice(-4)}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 text-xs">{formatNum(h.uiAmount)}</span>
                        <span className="font-mono text-white font-semibold text-xs">{pct.toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#1a1a1a] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-yellow-400"
                        style={{ width: `${Math.min(pct * 5, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Believer NFT */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🎖️</span>
            <p className="text-sm font-semibold text-gray-300">Believer NFT</p>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Believer NFTs grant holders exclusive access across the Candle ecosystem.
          </p>
          <div className="space-y-2">
            {nftBenefits.map((b) => (
              <div key={b} className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-yellow-400">✦</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-[#1c1c1c] flex justify-between text-sm">
            <span className="text-gray-500">Total Supply</span>
            <span className="font-bold text-white">1,000 NFTs</span>
          </div>
        </div>
      </div>

      {/* Staking Tiers */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1a1a1a]">
          <p className="text-sm font-semibold text-gray-300">Staking Tiers</p>
        </div>
        <div className="grid grid-cols-3 px-5 py-3 text-xs text-gray-500 uppercase tracking-widest border-b border-[#1c1c1c]">
          <span>Tier</span>
          <span>Min Stake</span>
          <span className="text-right">APY</span>
        </div>
        {stakingTiers.map((tier) => (
          <div
            key={tier.tier}
            className="grid grid-cols-3 items-center px-5 py-4 border-b border-[#1a1a1a] last:border-0 hover:bg-[#151515] transition-colors"
          >
            <span className={`font-bold text-sm ${tierColors[tier.tier]}`}>{tier.tier}</span>
            <span className="text-sm font-mono text-gray-300">{tier.minStake} CNDL</span>
            <span className="text-right text-sm font-mono font-bold text-green-400">{tier.apy}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
