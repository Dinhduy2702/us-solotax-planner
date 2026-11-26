/**
 * Dynamic Result-Driven CTA Engine (R&D Upgrade — 2026 CRO Standard)
 * Automatically personalizes inline Gumroad CTAs with the exact live numbers calculated by the user.
 */
(function () {
  "use strict";
  const RULES = [{"slot": "scorp", "id": "scNetSavings", "tpl": "Lock in your {val}/yr S-Corp savings & 1040-ES vault", "sub": "Free $0 Lite available · Zero monthly subscriptions — Schedule C, P&L & S-Corp monitor.", "btn": "Get 1099 Tax OS ($0 / $24) &rarr;", "url": "https://897833387907.gumroad.com/l/us-freelancer-1099-tax-pnl-os-2026"}, {"slot": "solo401k", "id": "s4MaxSolo", "tpl": "Track your {val} Solo 401(k) & 1099 tax write-offs", "sub": "Save $14 · Includes FULL Wealth OS ($19) + FULL 1099 Tax OS ($24) in one bundle.", "btn": "Get Bundle ($29 · Save $14) &rarr;", "url": "https://897833387907.gumroad.com/l/us-money-1099-tax-bundle-2026"}, {"slot": "rate", "id": "rtHourlyOut", "tpl": "Bill {val} & auto-invoice clients locally", "sub": "100% private MV3 extension — Live Timer Badge, 1099 Tax Vault & 1-Click PDF Invoice.", "btn": "Get BillSnap Pro ($15) &rarr;", "url": "https://897833387907.gumroad.com/l/billsnap-freelance-pro"}];

  function syncRule(rule) {
    const src = document.getElementById(rule.id);
    const box = document.querySelector('[data-result-cta="' + rule.slot + '"]');
    if (!src || !box) return;
    const raw = (src.textContent || "").trim();
    if (!raw) return;
    const headline = rule.tpl.replace("{val}", raw);
    if (box.dataset.lastDynamicHeadline === headline) return;
    box.dataset.lastDynamicHeadline = headline;
    box.innerHTML =
      '<div class="result-cta-copy">' +
        '<strong>' + headline + '</strong>' +
        '<span style="display:block;font-size:0.8rem;color:var(--text-secondary);margin-top:0.15rem;">' + rule.sub + '</span>' +
      '</div>' +
      '<div class="result-cta-action" style="flex-shrink:0;">' +
        '<a class="btn btn-primary btn-sm" href="' + rule.url + '" target="_blank" rel="noopener noreferrer">' + rule.btn + '</a>' +
      '</div>';
  }

  function syncAll() {
    RULES.forEach(syncRule);
  }

  function boot() {
    syncAll();
    const obs = new MutationObserver(syncAll);
    RULES.forEach(function (r) {
      const el = document.getElementById(r.id);
      if (el) obs.observe(el, { childList: true, characterData: true, subtree: true });
    });
    document.addEventListener("input", function () { setTimeout(syncAll, 20); });
    document.addEventListener("change", function () { setTimeout(syncAll, 20); });
    document.addEventListener("click", function () { setTimeout(syncAll, 40); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 50); });
  } else {
    setTimeout(boot, 50);
  }
})();
