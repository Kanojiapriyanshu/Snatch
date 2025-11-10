export const pricingGuides = {
  INR: {
    symbol: "₹",
    tiers: [
      { tier: "Nano", followers: "1k - 10k", engagement: "5% - 10%", post: "₹1,000 - ₹3,000", story: "₹300 - ₹800", reel: "₹1,500 - ₹4,000" },
      { tier: "Micro", followers: "10k - 50k", engagement: "4% - 8%", post: "₹3,000 - ₹10,000", story: "₹800 - ₹2,000", reel: "₹4,000 - ₹12,000" },
      { tier: "Mid-Tier", followers: "50k - 200k", engagement: "3% - 6%", post: "₹10,000 - ₹25,000", story: "₹2,000 - ₹5,000", reel: "₹12,000 - ₹30,000" },
    ],
  },
  USD: {
    symbol: "$",
    tiers: [
      { tier: "Nano", followers: "1k - 10k", engagement: "5% - 10%", post: "$50 - $150", story: "$15 - $50", reel: "$100 - $250" },
      { tier: "Micro", followers: "10k - 50k", engagement: "4% - 8%", post: "$150 - $500", story: "$50 - $120", reel: "$250 - $800" },
      { tier: "Mid-Tier", followers: "50k - 200k", engagement: "3% - 6%", post: "$500 - $1,500", story: "$120 - $300", reel: "$800 - $2,500" },
    ],
  },
  EUR: {
    symbol: "€",
    tiers: [
      { tier: "Nano", followers: "1k - 10k", engagement: "5% - 10%", post: "€40 - €120", story: "€10 - €35", reel: "€80 - €200" },
      { tier: "Micro", followers: "10k - 50k", engagement: "4% - 8%", post: "€120 - €400", story: "€35 - €90", reel: "€200 - €700" },
      { tier: "Mid-Tier", followers: "50k - 200k", engagement: "3% - 6%", post: "€400 - €1,200", story: "€90 - €250", reel: "€700 - €2,000" },
    ],
  },
  CAD: {
    symbol: "C$",
    tiers : [
      { tier: "Nano", followers: "1k - 10k", engagement: "5% - 10%", post: "C$60 - C$180", story: "C$20 - C$60", reel: "C$120 - C$300" },
      { tier: "Micro", followers: "10k - 50k", engagement: "4% - 8%", post: "C$180 - C$600", story: "C$60 - C$150", reel: "C$300 - C$900" },
      { tier: "Mid-Tier", followers: "50k - 200k", engagement: "3% - 6%", post: "C$600 - C$2,800", story: "C$150 - C$400", reel: "C$900 - C$3,000" },
    ]
  },
  AUD: {
    symbol: "A$",
    tiers: [
      { tier: "Nano", followers: "1k - 10k", engagement: "5% - 10%", post: "A$70 - A$200", story: "A$25 - A$60", reel: "A$120 - A$300" },
      { tier: "Micro", followers: "10k - 50k", engagement: "4% - 8%", post: "A$200 - A$700", story: "A$60 - A$150", reel: "A$300 - A$900" },
      { tier: "Mid-Tier", followers: "50k - 200k", engagement: "3% - 6%", post: "A$700 - A$2,500", story: "A$150 - A$400", reel: "A$900 - A$3,000" },
    ]
  },
  AED: {
    symbol: "د.إ",
    tiers: [
      { tier: "Nano", followers: "1k - 10k", engagement: "5% - 10%", post: "د.إ900 - د.إ300", story: "د.إ300 - د.إ100", reel: "د.إ1,800 - د.إ600" },
      { tier: "Micro", followers: "10k - 50k", engagement: "4% - 8%", post: "د.إ3,000 - د.إ900", story: "د.إ700 - د.إ300", reel: "د.إ5,000 - د.إ1,800" },
      { tier: "Mid-Tier", followers: "50k - 200k", engagement: "3% - 6%", post: "د.إ8,000 - د.إ3,000", story: "د.إ1,800 - د.إ700", reel: "د.إ12,000 - د.إ5,000" }
    ]
  },
  CNY: {
    symbol: "¥",
    tiers: [
      { tier: "Nano", followers: "1k - 10k", engagement: "5% - 10%", post: "¥1,000 - ¥3,000", story: "¥300 - ¥800", reel: "¥1,500 - ¥4,000" },
      { tier: "Micro", followers: "10k - 50k", engagement: "4% - 8%", post: "¥3,000 - ¥10,000", story: "¥800 - ¥2,000", reel: "¥4,000 - ¥12,000" },
      { tier: "Mid-Tier", followers: "50k - 200k", engagement: "3% - 6%", post: "¥10,000 - ¥25,000", story: "¥2,000 - ¥5,000", reel: "¥12,000 - ¥30,000" }
    ]
  },
  BRL: {
    symbol: "R$",
    tiers: [
    { tier: "Nano", followers: "1k - 10k", engagement: "5% - 10%", post: "R$400 - R$1,200", story: "R$120 - R$400", reel: "R$600 - R$1,800" },
    { tier: "Micro", followers: "10k - 50k", engagement: "4% - 8%", post: "R$1,200 - R$1,000", story: "R$400 - R$1,000", reel: "R$1,200 - R$4,000" },
    { tier: "Mid-Tier", followers: "50k - 200k", engagement: "3% - 6%", post: "R$3,500 - R$9,000", story: "R$1,000 - R$2,500", reel: "R$4,000 - R$12,000" }
    ]
  },
  IDR: {
    symbol: "Rp",
    tiers: [
      { tier: "Nano", followers: "1k - 10k", engagement: "5% - 10%", post: "Rp300K - Rp800K", story: "Rp80K - Rp250K", reel: "Rp500K - Rp1.5M" },
      { tier: "Micro", followers: "10k - 50k", engagement: "4% - 8%", post: "Rp800K - Rp2.5M", story: "Rp250K - Rp1,500,000", reel: "Rp1.5M - Rp9.5M" },
      { tier: "Mid-Tier", followers: "50k - 200k", engagement: "3% - 6%", post: "Rp2.5M - Rp7M", story: "Rp700K - Rp2M", reel: "Rp5M - Rp15M" }
    ]
  },
  

};
