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
      label: "Watch US Solopreneur Tax Guides",
      url: "" // AGY 3 cap nhat link kenh YT Finance EN khi lap xong
    },
    gumroadFreelanceOs: {
      label: "US Freelancer 1099 Tax OS (2026 Sheets)",
      url: "" // AGY 5 cap nhat link Gumroad SP #4 (US Freelancer 1099 Tax OS) khi xong
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
      badge: "Bookkeeping",
      title: "1099 Expense Tracking & Quarterly IRS Safe-Harbor Tools",
      summary: "Separate business write-offs (home office, software, $0.70/mi mileage) so you never overpay self-employment tax.",
      ctaLabel: "Compare 1099 Bookkeeping Apps",
      checklistTitle: "1099 Write-Off & Rate Playbook",
      checklist: [
        "Price hourly rates using realistic billable hours (22 to 28 hrs/week), not 40 hrs/week.",
        "Bake 15.3% SE tax, health insurance, and 3 to 4 weeks of unpaid PTO into every client quote.",
        "Pay IRS 1040-ES quarterly deadlines (Apr 15, Jun 15, Sep 15, Jan 15) via free IRS Direct Pay.",
        "Auto-transfer 25% to 30% of every paid invoice into a dedicated High-Yield Tax Vault."
      ],
      url: "" // Dan link Affiliate QuickBooks Self-Employed / FreshBooks / Wave
    }
  ]
};
