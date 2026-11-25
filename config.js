/**
 * SoloTax US - 2026 LLC vs. S-Corp, Solo 401(k) & Freelance Rate Planner
 * SINGLE CONFIGURATION FILE FOR AFFILIATE OFFERS & ECOSYSTEM LINKS
 */
window.SOLOTAX_CONFIG = {
  brand: {
    name: "SoloTax US",
    subtitle: "2026 LLC vs. S-Corp & Solo 401(k) Planner",
    year: "2026"
  },
  ecosystem: {
    smartMoneyUrl: "https://dinhduy2702.github.io/us-smart-money-calculators/",
    debtFreeUrl: "https://dinhduy2702.github.io/us-debt-free-planner/",
    propYieldUrl: "https://dinhduy2702.github.io/us-propyield-analyzer/",
    retireSmartUrl: "https://dinhduy2702.github.io/us-retiresmart-planner/",
    youtubeFinance: {
      label: "US Money & 1099 Bundle ($29 · Save $14)",
      url: "https://897833387907.gumroad.com/l/us-money-1099-tax-bundle-2026"
    },
    gumroadFreelanceOs: {
      label: "Get 1099 Tax OS ($0 Lite / $24 Full)",
      url: "https://897833387907.gumroad.com/l/us-freelancer-1099-tax-pnl-os-2026"
    }
  },
  affiliates: [
    {
      id: "scorp-payroll",
      context: ["scorp", "solo401k", "rate"],
      badge: "S-Corp Payroll",
      title: "Automated S-Corp W-2 Payroll & Tax Filing (Gusto / Collective)",
      summary: "IRS rules require S-Corp owners to pay themselves a reasonable W-2 salary through formal payroll with quarterly 941 filings.",
      ctaLabel: "Compare S-Corp Payroll Tools",
      checklistTitle: "IRS Form 2553 & Payroll Checklist",
      checklist: [
        "File IRS Form 2553 within 75 days of the tax year start (March 15 for calendar-year LLCs).",
        "Document your W-2 Reasonable Salary benchmark (typically 40% to 60% of net profit).",
        "Run formal W-2 payroll (Gusto, ADP, or Collective) to withhold FICA and file Form 941.",
        "Keep a separate business checking account so owner distributions never commingle with personal funds."
      ],
      url: "" // Dan link Affiliate Gusto / Collective / Bench
    },
    {
      id: "solo401k-provider",
      context: ["solo401k", "scorp"],
      badge: "Tax-Advantaged",
      title: "$0-Fee Solo 401(k) & SEP-IRA Brokerages (Fidelity / Schwab / Vanguard)",
      summary: "Shelter up to $70,000+ of 2026 self-employed profit from federal income taxes while compounding in low-cost index ETFs.",
      ctaLabel: "Compare Solo 401(k) Accounts",
      checklistTitle: "Solo 401(k) Dec 31 Deadline Checklist",
      checklist: [
        "Open your Solo 401(k) plan document BEFORE December 31 to lock in Employee Elective Deferrals.",
        "S-Corp owners: Employer 25% profit-sharing is strictly based on W-2 Box 1 wages, NOT K-1 distributions.",
        "Sole Props (Schedule C): Employer contribution uses the 20% effective rate of (Net Profit - 1/2 SE Tax).",
        "If your Solo 401(k) balance exceeds $250,000 at year-end, remember to file IRS Form 5500-EZ."
      ],
      url: "" // Dan link Affiliate Fidelity / Schwab / Carry / MySolo401k
    },
    {
      id: "bookkeeping",
      context: ["scorp", "solo401k", "rate"],
      badge: "BillSnap Pro · $15",
      title: "BillSnap Pro — Local Freelance Timer & Auto 1099 Tax Vault",
      summary: "Track billable client hours with a Live Toolbar Badge, auto-calculate 1099 quarterly tax vaults, and export 1-Click Client Invoice PDFs & Schedule C CSVs.",
      ctaLabel: "Get BillSnap Pro ($15 Lifetime)",
      url: "https://897833387907.gumroad.com/l/billsnap-freelance-pro"
    }
  ]
};
