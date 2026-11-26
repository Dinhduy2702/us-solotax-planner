(function () {
  "use strict";

  const THEME_KEY = "solotax_us_theme_v1";
  const STATE_KEY = "solotax_us_state_v1";
  const CONFIG = window.SOLOTAX_CONFIG;

  // 2026 IRS Thresholds
  const SS_CAP_2026 = 176100;
  const SOLO401K_EMP_CAP = 23500;
  const SOLO401K_TOTAL_CAP = 70000;
  const CATCHUP_50 = 7500;
  const CATCHUP_60_63 = 11250;

  const TOOL_META = {
    scorp: {
      title: "2026 LLC vs. S-Corp Real Tax Savings Optimizer",
      desc: "Compare standard LLC (Sole Prop) self-employment tax against an S-Corp election after real payroll, CPA 1120-S, and state compliance overhead."
    },
    solo401k: {
      title: "2026 Solo 401(k) vs. SEP-IRA Max Contribution Calculator",
      desc: "Calculate your exact IRS maximum retirement deduction separating Sole Prop (Schedule C) vs. S-Corp (W-2 Box 1 wages) and see your immediate 2026 tax cut."
    },
    rate: {
      title: "Freelance Hourly Rate & W-2 Equivalent Reverse Calculator",
      desc: "Reverse-calculate your minimum hourly rate, day rate, and annual revenue target after 15.3% SE taxes, health insurance, PTO, and non-billable hours."
    }
  };

  const PRESETS = {
    scorp: [
      { label: "Creator ($90k · 50% W-2)", set: { scProfit: 90000, scSalaryPct: 50, scPayrollCost: 600, scCpaCost: 1500, scStateFee: 300, scTargetNet: 3000 } },
      { label: "Consultant ($150k · 45% W-2)", set: { scProfit: 150000, scSalaryPct: 45, scPayrollCost: 600, scCpaCost: 1800, scStateFee: 300, scTargetNet: 5000 } },
      { label: "CA S-Corp ($180k · $800 CA Fee)", set: { scProfit: 180000, scSalaryPct: 45, scPayrollCost: 720, scCpaCost: 2200, scStateFee: 800, scTargetNet: 6000 } },
      { label: "Early Stage ($55k · Check)", set: { scProfit: 55000, scSalaryPct: 55, scPayrollCost: 600, scCpaCost: 1500, scStateFee: 300, scTargetNet: 2500 } }
    ],
    solo401k: [
      { label: "Sole Prop ($110k · Under 50)", set: { s4Entity: "soleprop", s4Age: "under50", s4Income: 110000, s4TaxBracket: 28, s4Other401k: 0 } },
      { label: "S-Corp W-2 ($85k · Under 50)", set: { s4Entity: "scorp", s4Age: "under50", s4Income: 85000, s4TaxBracket: 30, s4Other401k: 0 } },
      { label: "Age 50+ Max ($220k · Sole Prop)", set: { s4Entity: "soleprop", s4Age: "50plus", s4Income: 220000, s4TaxBracket: 35, s4Other401k: 0 } },
      { label: "Side Hustle ($45k · W-2 Used $15k)", set: { s4Entity: "soleprop", s4Age: "under50", s4Income: 45000, s4TaxBracket: 24, s4Other401k: 15000 } }
    ],
    rate: [
      { label: "Match $100k W-2 (25 billable hrs)", set: { rtTargetW2: 100000, rtBillableHrs: 25, rtWeeksOff: 4, rtHealth: 7200, rtExpenses: 6000, rtTaxBuffer: 7.65 } },
      { label: "Senior Dev ($160k W-2 · 28 hrs)", set: { rtTargetW2: 160000, rtBillableHrs: 28, rtWeeksOff: 4, rtHealth: 9000, rtExpenses: 8000, rtTaxBuffer: 7.65 } },
      { label: "Part-Time ($65k · 18 hrs/wk)", set: { rtTargetW2: 65000, rtBillableHrs: 18, rtWeeksOff: 5, rtHealth: 4800, rtExpenses: 3500, rtTaxBuffer: 7.65 } }
    ]
  };

  const RESULT_CTA_COPY = {
    scorp: {
      title: "Track Your 1099 Profit, Write-Offs & S-Corp Break-Even Automatically",
      desc: "Pair SoloTax US with the 2026 US Freelancer 1099 Tax OS (Google Sheets) so tax season takes minutes."
    },
    solo401k: {
      title: "Track Every Business Deduction & Solo 401(k) Bucket in One Sheet",
      desc: "Log Schedule C expenses, quarterly IRS 1040-ES payments, and retirement limits inside Google Sheets."
    },
    rate: {
      title: "Log Client Invoices, Billable Hours & 2026 Tax Reserves in One OS",
      desc: "Turn your target hourly rate into an automated 1099 profit and tax dashboard in Google Sheets."
    }
  };

  const SAVED_FIELDS = [
    "scProfit", "scSalaryPct", "scPayrollCost", "scCpaCost", "scStateFee", "scTargetNet",
    "s4Entity", "s4Age", "s4Income", "s4TaxBracket", "s4Other401k",
    "rtTargetW2", "rtBillableHrs", "rtWeeksOff", "rtHealth", "rtExpenses", "rtTaxBuffer"
  ];

  const URL_MAP = {
    scorp: { profit: "scProfit", salPct: "scSalaryPct", pay: "scPayrollCost", cpa: "scCpaCost", state: "scStateFee", target: "scTargetNet" },
    solo401k: { entity: "s4Entity", age: "s4Age", inc: "s4Income", bracket: "s4TaxBracket", used: "s4Other401k" },
    rate: { w2: "rtTargetW2", hrs: "rtBillableHrs", off: "rtWeeksOff", health: "rtHealth", exp: "rtExpenses", buf: "rtTaxBuffer" }
  };

  let activeTool = "scorp";
  let lastSummaryText = "";
  let lastTierRows = [];
  let lastRequiredProfit = 0;
  let toastTimer = null;

  const $ = (id) => document.getElementById(id);

  function fmtUSD(n) {
    const val = Math.round(Number(n) || 0);
    return (val < 0 ? "-$" : "$") + Math.abs(val).toLocaleString("en-US");
  }

  function showToast(msg) {
    const box = $("toastBox");
    box.textContent = msg;
    box.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { box.hidden = true; }, 2600);
  }

  function downloadCsv(filename, headers, rows) {
    const lines = [headers.join(",")].concat(
      rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`);
  }

  function saveState() {
    const data = {};
    SAVED_FIELDS.forEach((id) => {
      const el = $(id);
      if (el) data[id] = el.value;
    });
    try { localStorage.setItem(STATE_KEY, JSON.stringify(data)); } catch (_) {}
  }

  function restoreState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      SAVED_FIELDS.forEach((id) => {
        const el = $(id);
        if (el && data[id] !== undefined) el.value = data[id];
      });
    } catch (_) {}
  }

  function buildShareUrl() {
    const params = new URLSearchParams();
    params.set("tab", activeTool);
    const map = URL_MAP[activeTool] || {};
    Object.entries(map).forEach(([k, id]) => {
      const el = $(id);
      if (el) params.set(k, el.value);
    });
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }

  const STATE_SCORP_FEES = {
    CA: 1800, TX: 0, NY: 300, FL: 150, WA: 200,
    NJ: 500, IL: 1800, MA: 456, VA: 100, CO: 50,
    GA: 50, NC: 200, PA: 50, OH: 0, AZ: 0,
    MI: 25, TN: 1500, NV: 350, OR: 250, MD: 300
  };

  function applyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    if ([...params.keys()].length === 0) return null;

    const stateParam = (params.get("state") || "").toUpperCase();
    if (stateParam && Object.prototype.hasOwnProperty.call(STATE_SCORP_FEES, stateParam)) {
      if ($("scStateFee")) $("scStateFee").value = STATE_SCORP_FEES[stateParam];
    }
    if (params.has("profit") && $("scProfit")) {
      $("scProfit").value = params.get("profit");
    }

    const tabParam = params.get("tab");
    const targetTab = TOOL_META[tabParam] ? tabParam : null;
    if (!targetTab) return stateParam ? "scorp" : null;
    const map = URL_MAP[targetTab] || {};
    Object.entries(map).forEach(([k, id]) => {
      if (params.has(k) && $(id)) $(id).value = params.get(k);
    });
    return targetTab;
  }

  function syncSliders() {
    $("scProfitSlider").value = Math.min(400000, Math.max(30000, Number($("scProfit").value) || 30000));
    $("scSalarySlider").value = Math.min(75, Math.max(30, Number($("scSalaryPct").value) || 45));
    $("s4IncomeSlider").value = Math.min(350000, Math.max(20000, Number($("s4Income").value) || 20000));
    $("rtTargetSlider").value = Math.min(300000, Math.max(40000, Number($("rtTargetW2").value) || 40000));
  }

  /* Core SE Tax vs S-Corp Payroll Math */
  function calcScorpForProfit(profit, salPct, overhead) {
    const p = Math.max(0, profit);
    // Standard LLC (Sole Prop): 15.3% SE tax on 92.35% of profit (12.4% capped at SS_CAP_2026 + 2.9% uncapped)
    const seBase = p * 0.9235;
    const llcSeTax = Math.min(seBase, SS_CAP_2026) * 0.124 + seBase * 0.029;

    // S-Corp: W-2 Salary subject to 15.3% combined FICA (employer + employee); K-1 distribution = 0% FICA
    const w2 = p * (salPct / 100);
    const k1 = Math.max(0, p - w2);
    const corpFica = Math.min(w2, SS_CAP_2026) * 0.124 + w2 * 0.029;
    const grossSavings = Math.max(0, llcSeTax - corpFica);
    const netSavings = grossSavings - overhead;
    return { llcSeTax, w2, k1, corpFica, grossSavings, netSavings };
  }

  /* TAB 1: LLC VS S-CORP */
  function updateScorp() {
    const profit = Math.max(0, Number($("scProfit").value) || 0);
    const salPct = Math.min(85, Math.max(25, Number($("scSalaryPct").value) || 45));
    const payroll = Math.max(0, Number($("scPayrollCost").value) || 0);
    const cpa = Math.max(0, Number($("scCpaCost").value) || 0);
    const stateFee = Math.max(0, Number($("scStateFee").value) || 0);
    const targetNet = Math.max(0, Number($("scTargetNet").value) || 4000);

    const overhead = payroll + cpa + stateFee;
    const res = calcScorpForProfit(profit, salPct, overhead);

    $("scProfitHint").textContent = `${fmtUSD(profit)} / yr`;
    $("scSalaryHint").textContent = `${salPct}% (${fmtUSD(res.w2)} W-2)`;

    // Find lowest profit tier where netSavings >= desiredNet (handles non-monotonic SS cap region accurately)
    const findProfitForNet = (desiredNet) => {
      for (let p = 10000; p <= 800000; p += 1000) {
        if (calcScorpForProfit(p, salPct, overhead).netSavings >= desiredNet) return p;
      }
      return 800000;
    };

    const breakEven = findProfitForNet(0);
    lastRequiredProfit = findProfitForNet(targetNet);

    $("scNetSavings").textContent = fmtUSD(res.netSavings);
    $("scVerdictSub").textContent = `${fmtUSD(res.grossSavings)} gross SE tax cut minus ${fmtUSD(overhead)}/yr overhead`;
    $("scLlcTax").textContent = fmtUSD(res.llcSeTax);
    $("scCorpTax").textContent = fmtUSD(res.corpFica);
    $("scK1Dist").textContent = fmtUSD(res.k1);
    $("scBreakEven").textContent = fmtUSD(breakEven);
    $("scRequiredProfit").textContent = `${fmtUSD(lastRequiredProfit)} / yr`;

    const badge = $("scVerdictBadge");
    if (res.netSavings >= 2500) {
      badge.className = "status-pill pass";
      badge.textContent = "Worth Switching to S-Corp";
    } else if (res.netSavings > 0) {
      badge.className = "status-pill warn";
      badge.textContent = "Borderline Savings";
    } else {
      badge.className = "status-pill warn";
      badge.textContent = "Stay Standard LLC";
    }

    $("scInsightBox").innerHTML = res.netSavings >= 2500
      ? `<strong>Why S-Corp Wins Here:</strong> Paying yourself a <strong>${fmtUSD(res.w2)}</strong> W-2 salary shields <strong>${fmtUSD(res.k1)}</strong> in K-1 distributions from the 15.3% self-employment tax, netting <strong>${fmtUSD(res.netSavings)}/yr</strong> even after ${fmtUSD(overhead)} in payroll &amp; CPA costs.`
      : `<strong>Stay LLC for Now:</strong> With ${fmtUSD(overhead)}/yr in S-Corp overhead, your break-even profit is <strong>${fmtUSD(breakEven)}</strong>. Wait until profit consistently passes ${fmtUSD(breakEven + 15000)} so the paperwork pays off.`;

    const smartUrl = `${CONFIG.ecosystem.smartMoneyUrl}?tab=freelance&rev=${Math.round(profit)}&exp=0`;
    $("scBridgeBox").innerHTML = `
      <div>
        <strong>Need Your Exact 50-State IRS Quarterly 1040-ES Calendar?</strong><br>
        Run your <strong>${fmtUSD(profit)}</strong> profit through SmartMoney US to get your Apr 15 / Jun 15 / Sep 15 / Jan 15 payment schedule.
      </div>
      <a class="btn btn-primary btn-sm" href="${smartUrl}" target="_blank" rel="noopener noreferrer" style="flex-shrink:0;">Open 1099 Tax Calendar &rarr;</a>
    `;

    // Profit Tier Table
    const tiers = [60000, 90000, 120000, 160000, 220000, 300000];
    if (!tiers.includes(Math.round(profit))) {
      tiers.push(Math.round(profit));
      tiers.sort((a, b) => a - b);
    }
    lastTierRows = tiers.map((t) => {
      const m = calcScorpForProfit(t, salPct, overhead);
      const rec = m.netSavings >= 2500 ? "Elect S-Corp" : (m.netSavings > 0 ? "Borderline" : "Stay LLC");
      return { profit: t, llcTax: m.llcSeTax, corpTotal: m.corpFica + overhead, netSavings: m.netSavings, rec };
    });

    $("scTierTableBody").innerHTML = lastTierRows.map((row) => {
      const isCur = row.profit === Math.round(profit);
      const pill = row.rec === "Elect S-Corp"
        ? `<span class="status-pill pass">Elect S-Corp</span>`
        : `<span class="status-pill warn">${row.rec}</span>`;
      return `
        <tr class="${isCur ? "is-active-row" : ""}">
          <td>${fmtUSD(row.profit)}${isCur ? " · Your Profit" : ""}</td>
          <td>${fmtUSD(row.llcTax)}</td>
          <td>${fmtUSD(row.corpTotal)}</td>
          <td><strong>${fmtUSD(row.netSavings)}</strong></td>
          <td>${pill}</td>
        </tr>
      `;
    }).join("");

    if (activeTool === "scorp") {
      lastSummaryText = `SoloTax US (2026): ${fmtUSD(profit)} profit (${salPct}% W-2, ${fmtUSD(overhead)} overhead) -> ${fmtUSD(res.netSavings)}/yr net S-Corp savings (Break-even: ${fmtUSD(breakEven)}).`;
    }
  }

  /* TAB 2: SOLO 401(K) VS SEP-IRA */
  function updateSolo401k() {
    const entity = $("s4Entity").value;
    const age = $("s4Age").value;
    const income = Math.max(0, Number($("s4Income").value) || 0);
    const bracket = Math.min(55, Math.max(0, Number($("s4TaxBracket").value) || 28)) / 100;
    const usedOther = Math.max(0, Number($("s4Other401k").value) || 0);

    $("s4IncomeLabel").textContent = entity === "scorp" ? "S-Corp W-2 Box 1 Salary ($)" : "Schedule C Net Profit ($)";
    $("s4IncomeHint").textContent = `${fmtUSD(income)} / yr`;

    const catchup = age === "60to63" ? CATCHUP_60_63 : (age === "50plus" ? CATCHUP_50 : 0);
    const empCapRemaining = Math.max(0, SOLO401K_EMP_CAP - usedOther);

    let empPart = 0;
    let employerPart = 0;
    let sepMax = 0;

    if (entity === "scorp") {
      // S-Corp: strictly W-2 wages. Employee up to 100% of W-2 (capped); Employer up to 25% of W-2.
      empPart = Math.min(income, empCapRemaining);
      employerPart = income * 0.25;
      sepMax = Math.min(SOLO401K_TOTAL_CAP, income * 0.25);
    } else {
      // Sole Prop: Net Earnings = Profit - 1/2 SE Tax. Employer = 20% of Net Earnings.
      const seBase = income * 0.9235;
      const seTax = Math.min(seBase, SS_CAP_2026) * 0.124 + seBase * 0.029;
      const netEarned = Math.max(0, income - seTax / 2);
      empPart = Math.min(netEarned, empCapRemaining);
      employerPart = netEarned * 0.20;
      sepMax = Math.min(SOLO401K_TOTAL_CAP, netEarned * 0.20);
    }

    const baseCombined = Math.min(SOLO401K_TOTAL_CAP, empPart + employerPart);
    // Catch-up adds on top of the $70,000 combined cap (subject to earned income)
    const maxSolo = Math.min(income, baseCombined + (empPart > 0 || income > 0 ? Math.min(catchup, Math.max(0, income - baseCombined)) : 0));
    const displayEmployer = Math.max(0, Math.min(employerPart, SOLO401K_TOTAL_CAP - empPart));
    const taxSaved = maxSolo * bracket;
    const soloAdvantage = Math.max(0, maxSolo - sepMax);

    $("s4MaxSolo").textContent = fmtUSD(maxSolo);
    $("s4TaxSavedSub").textContent = `Immediate 2026 tax bill cut at ${Math.round(bracket * 100)}% bracket: ${fmtUSD(taxSaved)}`;
    $("s4AdvantageBadge").textContent = `+${fmtUSD(soloAdvantage)} More Than SEP-IRA`;
    $("s4EmployeePart").textContent = fmtUSD(empPart + (maxSolo - baseCombined));
    $("s4EmployerPart").textContent = fmtUSD(displayEmployer);
    $("s4SepMax").textContent = fmtUSD(sepMax);

    const maxBar = Math.max(1, maxSolo, sepMax);
    $("s4CompareBars").innerHTML = `
      <div>
        <div class="cbar-row-head"><span>Solo 401(k) Max (2026)</span><span class="tabular">${fmtUSD(maxSolo)}</span></div>
        <div class="cbar-track"><div class="cbar-fill" style="width:${((maxSolo / maxBar) * 100).toFixed(1)}%; background:var(--accent-emerald);"></div></div>
      </div>
      <div>
        <div class="cbar-row-head"><span>SEP-IRA Max (2026)</span><span class="tabular">${fmtUSD(sepMax)}</span></div>
        <div class="cbar-track"><div class="cbar-fill" style="width:${((sepMax / maxBar) * 100).toFixed(1)}%; background:var(--accent-navy);"></div></div>
      </div>
    `;

    $("s4InsightBox").innerHTML = entity === "scorp"
      ? `<strong>S-Corp IRS Rule Alert:</strong> Your employer contribution (${fmtUSD(displayEmployer)}) is strictly 25% of your <strong>W-2 Box 1 salary</strong>, not K-1 distributions. Solo 401(k) beats SEP-IRA by <strong>${fmtUSD(soloAdvantage)}</strong> because it unlocks the Employee Elective Deferral bucket.`
      : `<strong>Solo 401(k) Advantage:</strong> At ${fmtUSD(income)} Schedule C profit, a Solo 401(k) lets you shelter <strong>${fmtUSD(soloAdvantage)} more</strong> than a SEP-IRA, slashing your 2026 tax bill by <strong>${fmtUSD(taxSaved)}</strong>. Open the plan before Dec 31.`;

    if (activeTool === "solo401k") {
      lastSummaryText = `SoloTax US Solo 401(k) (${entity}): Max 2026 contribution ${fmtUSD(maxSolo)} vs SEP-IRA ${fmtUSD(sepMax)} -> saves ~${fmtUSD(taxSaved)} in taxes.`;
    }
  }

  /* TAB 3: FREELANCE HOURLY RATE REVERSE */
  function updateRate() {
    const targetW2 = Math.max(0, Number($("rtTargetW2").value) || 0);
    const billableHrs = Math.max(1, Number($("rtBillableHrs").value) || 25);
    const weeksOff = Math.min(30, Math.max(0, Number($("rtWeeksOff").value) || 4));
    const health = Math.max(0, Number($("rtHealth").value) || 0);
    const expenses = Math.max(0, Number($("rtExpenses").value) || 0);
    const taxBufferPct = Math.max(0, Number($("rtTaxBuffer").value) || 7.65) / 100;

    $("rtTargetHint").textContent = `${fmtUSD(targetW2)} / yr`;

    const workingWeeks = Math.max(1, 52 - weeksOff);
    const annualBillableHrs = workingWeeks * billableHrs;
    const seBufferDollar = targetW2 * taxBufferPct;
    const requiredRev = targetW2 + health + expenses + seBufferDollar;
    const minHourly = requiredRev / annualBillableHrs;
    const dayRate = minHourly * 7;
    const weeklyRev = requiredRev / workingWeeks;
    const w2Hourly = targetW2 / 2080;
    const mult = w2Hourly > 0 ? minHourly / w2Hourly : 0;

    $("rtHourlyOut").textContent = `${fmtUSD(Math.ceil(minHourly))}/hr`;
    $("rtRevSub").textContent = `Required annual gross revenue: ${fmtUSD(requiredRev)} (${workingWeeks} working weeks)`;
    $("rtBillableYearBadge").textContent = `${annualBillableHrs.toLocaleString("en-US")} billable hrs/yr`;
    $("rtDayRate").textContent = `${fmtUSD(Math.ceil(dayRate / 10) * 10)}/day`;
    $("rtWeeklyRev").textContent = `${fmtUSD(weeklyRev)}/wk`;
    $("rtW2Mult").textContent = `${mult.toFixed(2)}x W-2`;

    $("rtBreakdownBody").innerHTML = `
      <tr><td><span class="swatch" style="background:var(--accent-emerald);"></span>Target W-2 Equivalent Base Pay</td><td class="tabular">${fmtUSD(targetW2)}</td></tr>
      <tr><td><span class="swatch" style="background:var(--accent-navy);"></span>Employer-Half SE Tax Buffer (${(taxBufferPct * 100).toFixed(2)}%)</td><td class="tabular">${fmtUSD(seBufferDollar)}</td></tr>
      <tr><td><span class="swatch" style="background:var(--accent-amber);"></span>Self-Funded Health Insurance</td><td class="tabular">${fmtUSD(health)}</td></tr>
      <tr><td><span class="swatch" style="background:var(--accent-slate);"></span>Software, Hardware &amp; Overhead</td><td class="tabular">${fmtUSD(expenses)}</td></tr>
      <tr><td>Total Annual Gross Revenue Needed</td><td class="tabular">${fmtUSD(requiredRev)}</td></tr>
    `;

    $("rtInsightBox").innerHTML = `<strong>Why ${fmtUSD(Math.ceil(minHourly))}/hr Is NOT Greedy:</strong> A ${fmtUSD(targetW2)} W-2 employee makes ${fmtUSD(w2Hourly)}/hr on paper, but their employer pays 7.65% FICA, health insurance, software, and paid vacation. Because you only bill <strong>${billableHrs} hrs/wk</strong> (the rest is sales &amp; admin), charging <strong>${mult.toFixed(2)}x</strong> the W-2 hourly rate simply breaks even.`;

    if (activeTool === "rate") {
      lastSummaryText = `SoloTax US Rate Reverse: To match a ${fmtUSD(targetW2)} W-2 job (${billableHrs} billable hrs/wk), charge at least ${fmtUSD(Math.ceil(minHourly))}/hr (${fmtUSD(requiredRev)}/yr gross).`;
    }
  }

  /* Presets Bar */
  function renderPresets() {
    const list = PRESETS[activeTool] || [];
    $("quickPresetsRow").innerHTML = list.map((p, idx) =>
      `<button type="button" class="preset-chip" data-preset-idx="${idx}">${p.label}</button>`
    ).join("");

    $("quickPresetsRow").querySelectorAll(".preset-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const preset = list[Number(btn.dataset.presetIdx)];
        if (!preset || !preset.set) return;
        Object.entries(preset.set).forEach(([id, val]) => {
          const el = $(id);
          if (el) el.value = val;
        });
        syncSliders();
        recalcAll();
        saveState();
        showToast(`Loaded scenario: ${preset.label}`);
      });
    });
  }

  /* Offers, Checklists & Ecosystem Links (Zero Coming Soon / (Soon)) */
  function openModal() {
    const m = $("freelanceOsModal");
    if (m && typeof m.showModal === "function") m.showModal();
  }

  function renderOffers() {
    const matched = CONFIG.affiliates.filter((a) => a.context.includes(activeTool));
    const displayList = matched.length >= 3 ? matched.slice(0, 3) : CONFIG.affiliates.slice(0, 3);

    $("offersGrid").innerHTML = displayList.map((offer) => {
      const hasUrl = Boolean(offer.url && offer.url.trim());
      let actionHtml = "";
      if (hasUrl) {
        actionHtml = `<a class="btn btn-primary btn-sm" href="${offer.url}" target="_blank" rel="noopener noreferrer sponsored">${offer.ctaLabel}</a>`;
      } else {
        const itemsHtml = (offer.checklist || []).map((line) => `<li>${line}</li>`).join("");
        actionHtml = `
          <details class="offer-guide">
            <summary class="btn btn-sm">${offer.checklistTitle || "View 2026 Playbook"}</summary>
            <ul class="offer-guide-list">${itemsHtml}</ul>
          </details>
        `;
      }
      return `
        <article class="offer-card">
          <div>
            <span class="offer-badge">${offer.badge}</span>
            <h3>${offer.title}</h3>
            <p>${offer.summary}</p>
          </div>
          <div>${actionHtml}</div>
        </article>
      `;
    }).join("");

    const sheetOffer = CONFIG.ecosystem.gumroadFreelanceOs;
    const ytOffer = CONFIG.ecosystem.youtubeFinance;
    const hasSheetUrl = Boolean(sheetOffer.url && sheetOffer.url.trim());
    const hasYtUrl = Boolean(ytOffer.url && ytOffer.url.trim());

    const ecoBtns = [
      `<a class="btn btn-sm" href="${CONFIG.ecosystem.smartMoneyUrl}" target="_blank" rel="noopener noreferrer">SmartMoney US</a>`,
      `<a class="btn btn-sm" href="${CONFIG.ecosystem.debtFreeUrl}" target="_blank" rel="noopener noreferrer">DebtFree US</a>`,
      `<a class="btn btn-sm" href="${CONFIG.ecosystem.propYieldUrl}" target="_blank" rel="noopener noreferrer">PropYield US</a>`,
      `<a class="btn btn-sm" href="${CONFIG.ecosystem.retireSmartUrl}" target="_blank" rel="noopener noreferrer">RetireSmart US</a>`
    ];
    if (hasYtUrl) ecoBtns.push(`<a class="btn btn-sm" href="${ytOffer.url}" target="_blank" rel="noopener noreferrer">${ytOffer.label}</a>`);
    if (hasSheetUrl) {
      ecoBtns.push(`<a class="btn btn-sm btn-primary" href="${sheetOffer.url}" target="_blank" rel="noopener noreferrer">${sheetOffer.label}</a>`);
    } else {
      ecoBtns.push(`<button type="button" class="btn btn-sm btn-primary" data-open-os-modal="1">Preview 2026 1099 Tax OS (Free Lite)</button>`);
    }
    $("ecoLinksContainer").innerHTML = ecoBtns.join("");

    document.querySelectorAll("[data-result-cta]").forEach((box) => {
      const key = box.dataset.resultCta;
      const copy = RESULT_CTA_COPY[key] || RESULT_CTA_COPY.scorp;
      const btn = hasSheetUrl
        ? `<a class="btn btn-primary btn-sm" href="${sheetOffer.url}" target="_blank" rel="noopener noreferrer">${sheetOffer.label}</a>`
        : `<button type="button" class="btn btn-primary btn-sm" data-open-os-modal="1">Preview 2026 1099 Tax OS</button>`;
      box.innerHTML = `
        <div class="result-cta-copy">
          <strong>${copy.title}</strong>
          <p>${copy.desc}</p>
        </div>
        <div style="flex-shrink:0;">${btn}</div>
      `;
    });

    document.querySelectorAll("[data-open-os-modal]").forEach((b) => {
      b.addEventListener("click", openModal);
    });
  }

  function switchTool(toolId, updateHash) {
    if (!TOOL_META[toolId]) toolId = "scorp";
    activeTool = toolId;

    document.querySelectorAll(".tool-tab").forEach((btn) => {
      btn.setAttribute("aria-selected", String(btn.dataset.tool === toolId));
    });
    document.querySelectorAll(".calc-panel").forEach((panel) => {
      panel.hidden = panel.id !== "panel-" + toolId;
    });

    $("activeToolHeading").textContent = TOOL_META[toolId].title;
    $("activeToolDesc").textContent = TOOL_META[toolId].desc;

    if (updateHash) history.replaceState(null, "", "#" + toolId);

    renderPresets();
    recalcAll();
    renderOffers();
  }

  function recalcAll() {
    updateScorp();
    updateSolo401k();
    updateRate();
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
    $("themeToggleBtn").textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
  }

  function init() {
    $("brandNameText").textContent = CONFIG.brand.name;
    $("brandSubText").textContent = CONFIG.brand.subtitle;

    restoreState();
    const urlTab = applyUrlParams();
    syncSliders();
    applyTheme(localStorage.getItem(THEME_KEY) || "light");

    document.querySelectorAll(".tool-tab").forEach((btn) => {
      btn.addEventListener("click", () => switchTool(btn.dataset.tool, true));
    });

    $("themeToggleBtn").addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") || "light";
      applyTheme(cur === "dark" ? "light" : "dark");
    });

    $("shareLinkBtn").addEventListener("click", () => {
      const url = buildShareUrl();
      history.replaceState(null, "", url);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => showToast("Shareable link copied to clipboard!")).catch(() => showToast("Share link updated in address bar."));
      } else {
        showToast("Share link updated in address bar.");
      }
    });

    $("copyScenarioBtn").addEventListener("click", () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(lastSummaryText).then(() => showToast("Summary copied to clipboard.")).catch(() => showToast(lastSummaryText));
      } else {
        showToast(lastSummaryText);
      }
    });

    $("printReportBtn").addEventListener("click", () => window.print());

    $("resetDefaultsBtn").addEventListener("click", () => {
      try { localStorage.removeItem(STATE_KEY); } catch (_) {}
      window.location.href = window.location.pathname;
    });

    $("scApplyReverseBtn").addEventListener("click", () => {
      if (lastRequiredProfit > 0) {
        $("scProfit").value = lastRequiredProfit;
        $("scProfitSlider").value = Math.min(400000, Math.max(30000, lastRequiredProfit));
        updateScorp();
        saveState();
        showToast(`Testing ${fmtUSD(lastRequiredProfit)} annual profit.`);
      }
    });

    $("scExportCsvBtn").addEventListener("click", () => {
      downloadCsv(
        "solotax-us-llc-vs-scorp-2026.csv",
        ["Annual Net Profit ($)", "LLC SE Tax ($)", "S-Corp FICA + Overhead ($)", "True Net Savings ($)", "Recommendation"],
        lastTierRows.map((r) => [r.profit, Math.round(r.llcTax), Math.round(r.corpTotal), Math.round(r.netSavings), r.rec])
      );
    });

    const closeModal = () => {
      const m = $("freelanceOsModal");
      if (m && m.open) m.close();
    };
    $("closeModalBtn").addEventListener("click", closeModal);
    $("modalCloseFooterBtn").addEventListener("click", closeModal);
    $("modalPrintBtn").addEventListener("click", () => { closeModal(); window.print(); });

    const bind = (id, fn) => {
      const el = $(id);
      if (!el) return;
      const h = () => { fn(); saveState(); };
      el.addEventListener("input", h);
      el.addEventListener("change", h);
    };

    $("scProfit").addEventListener("input", (e) => {
      $("scProfitSlider").value = Math.min(400000, Math.max(30000, Number(e.target.value) || 30000));
      updateScorp(); saveState();
    });
    $("scProfitSlider").addEventListener("input", (e) => {
      $("scProfit").value = e.target.value;
      updateScorp(); saveState();
    });
    $("scSalaryPct").addEventListener("input", (e) => {
      $("scSalarySlider").value = Math.min(75, Math.max(30, Number(e.target.value) || 45));
      updateScorp(); saveState();
    });
    $("scSalarySlider").addEventListener("input", (e) => {
      $("scSalaryPct").value = e.target.value;
      updateScorp(); saveState();
    });
    ["scPayrollCost", "scCpaCost", "scStateFee", "scTargetNet"].forEach((id) => bind(id, updateScorp));

    $("s4Income").addEventListener("input", (e) => {
      $("s4IncomeSlider").value = Math.min(350000, Math.max(20000, Number(e.target.value) || 20000));
      updateSolo401k(); saveState();
    });
    $("s4IncomeSlider").addEventListener("input", (e) => {
      $("s4Income").value = e.target.value;
      updateSolo401k(); saveState();
    });
    ["s4Entity", "s4Age", "s4TaxBracket", "s4Other401k"].forEach((id) => bind(id, updateSolo401k));

    $("rtTargetW2").addEventListener("input", (e) => {
      $("rtTargetSlider").value = Math.min(300000, Math.max(40000, Number(e.target.value) || 40000));
      updateRate(); saveState();
    });
    $("rtTargetSlider").addEventListener("input", (e) => {
      $("rtTargetW2").value = e.target.value;
      updateRate(); saveState();
    });
    ["rtBillableHrs", "rtWeeksOff", "rtHealth", "rtExpenses", "rtTaxBuffer"].forEach((id) => bind(id, updateRate));

    const initialHash = (window.location.hash || "").replace("#", "");
    const startTab = urlTab || (TOOL_META[initialHash] ? initialHash : "scorp");
    switchTool(startTab, false);
  }

  init();
})();
