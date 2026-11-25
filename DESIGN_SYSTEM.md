# DESIGN SYSTEM CONTRACT: SoloTax US v1.0 (2026 LLC vs. S-Corp, Solo 401k & Freelance Rate Planner)

> Third pillar of the US Personal Finance SEO Triangle (**SmartMoney US** <-> **DebtFree US** <-> **SoloTax US**), paired directly with **AGY 5 SP #4: US Freelancer 1099 Tax OS**.

## 1. Visual Identity
- **Product Name:** `SoloTax US` (Sub-label: `2026 LLC vs. S-Corp & Solo 401(k) Planner`)
- **Aesthetic:** Swiss Editorial Fintech (`Newsreader` + `IBM Plex Sans`, `tabular-nums`, Light Mode default with full Dark Mode parity).

## 2. Hard Quality Locks (Zero Repeat Mistakes from SP #3 & SP #4)
- **Mobile `390px` Header Single-Row Lock:** `flex-wrap: nowrap`, truncated `.brand-sub` (`max-width: 190px; ellipsis`), ensuring `Dark Mode` button stays on row 1 (`header_height <= 64px`).
- **Zero "Coming Soon" or "(Soon)" text anywhere:** Every affiliate slot without a live URL renders an interactive **2026 Actionable Playbook Checklist** (`<details>`) + live **`Preview 2026 Freelancer 1099 Tax OS`** modal.
- **Mobile `390px` Action Bar:** Single-row scrollable tool tabs (`<= 56px`), single-row scrollable `Try a scenario` chips (`<= 56px`), and all 4 action buttons (`Share / Copy / Print / Reset`) locked to **1 horizontal row** (`0` overflow).
- **Input Alignment:** `align-items: end` across all multi-column form grids (`0px` bottom variance).
- **Decision-Grade Depth from v1.0:**
  1. **Tab 1 (`LLC vs. S-Corp Optimizer`):** Subtracts real S-Corp overhead (payroll + CPA 1120-S + state fee), computes **Net S-Corp Savings**, **Break-Even Net Profit**, W-2 Reasonable Salary slider, and **Reverse Check** for target net savings.
  2. **Tab 2 (`Solo 401(k) vs. SEP-IRA Max`):** Strictly follows 2026 IRS rules separating **Sole Prop (Schedule C)** vs. **S-Corp (W-2 Box 1 wages)**, supports Age 50+ Catch-Up, calculates immediate 2026 tax bill reduction, and exports **CSV**.
  3. **Tab 3 (`Freelance Hourly Rate Reverse`):** Reverse-calculates Minimum Hourly Rate, Day Rate, and Annual Revenue needed to match a target W-2 salary after 15.3% SE tax, health insurance, PTO, and non-billable admin hours.
