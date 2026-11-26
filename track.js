/* track.js — đo lượt xem + click Gumroad (GoatCounter, miễn phí, không cookie). */
(function () {
  var GC_CODE = 'smartmoneyus'; // điền mã GoatCounter (vd 'smartmoney') — để trống thì chỉ gắn UTM, không gửi dữ liệu
  var SITE = (location.pathname.split('/')[1] || location.hostname).slice(0, 40);

  function tag(a) {
    try {
      var u = new URL(a.href);
      if (u.hostname.indexOf('gumroad.com') < 0) return;
      if (!u.searchParams.has('utm_source')) u.searchParams.set('utm_source', SITE);
      if (!u.searchParams.has('utm_medium')) u.searchParams.set('utm_medium', 'web');
      u.searchParams.set('utm_campaign', location.pathname.replace(/\W+/g, '_').slice(0, 60) || 'home');
      a.href = u.toString();
    } catch (e) {}
  }
  function scan() { document.querySelectorAll('a[href*="gumroad.com"]').forEach(tag); }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="gumroad.com"]');
    if (!a) return;
    tag(a);
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({ path: 'click/' + SITE + '/' + (a.pathname.split('/').pop() || 'gumroad'), title: 'Gumroad click', event: true });
    }
  }, true);

  document.addEventListener('DOMContentLoaded', function () {
    scan();
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true }); // CTA đổi theo kết quả tính
  });

  if (GC_CODE) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://gc.zgo.at/count.js';
    s.setAttribute('data-goatcounter', 'https://' + GC_CODE + '.goatcounter.com/count');
    document.head.appendChild(s);
  }
})();
