/* Garba Night add-on: sticky note + event ribbon. Drop in with <script src="garba.js"></script> just before </body>. */
(function () {
  function init() {
    var header = document.querySelector('.col header');
    if (!header || document.getElementById('garbaNote')) return;

    // Font for the handwritten note
    if (!document.querySelector('link[href*="Caveat"]')) {
      var f = document.createElement('link');
      f.rel = 'stylesheet';
      f.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap';
      document.head.appendChild(f);
    }

    var st = document.createElement('style');
    st.textContent = [
      '.g-ribbon{display:flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:16px}',
      '.g-presents{font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;font-weight:600;color:var(--muted)}',
      '.g-chip{display:inline-flex;align-items:center;gap:10px;padding:6px 16px;border-radius:999px;border:1px solid var(--gold);background:rgba(216,176,106,.12);color:var(--gold2);font-size:11.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase}',
      '.g-chip i{width:5px;height:5px;background:var(--gold);transform:rotate(45deg);display:inline-block}',
      '.g-note{position:relative;max-width:330px;margin:22px auto 4px;padding:26px 22px 18px;text-align:left;color:#4a1220;',
      ' background:linear-gradient(180deg,#f9dd8f 0%,#f4cf72 100%);transform:rotate(-2.2deg);transition:transform .25s ease;',
      ' box-shadow:0 14px 26px rgba(0,0,0,.45),inset 0 -22px 30px -26px rgba(120,70,0,.45);border-radius:2px 2px 14px 2px}',
      '.g-note:hover{transform:rotate(0deg) translateY(-2px)}',
      '.g-note::before{content:"";position:absolute;top:-11px;left:50%;width:84px;height:22px;margin-left:-42px;transform:rotate(2deg);background:rgba(255,246,224,.55);border:1px solid rgba(255,255,255,.35);box-shadow:0 1px 3px rgba(0,0,0,.25)}',
      '.g-note h3{font-family:"Caveat","Segoe Script",cursive;font-weight:700;font-size:31px;line-height:1;margin:0 0 8px;color:#6b1426}',
      '.g-note p{font-size:12.5px;line-height:1.5;margin:0;color:#5a2a2f}',
      '.g-meta{margin-top:12px;padding-top:10px;border-top:1px dashed rgba(107,20,38,.4);font-size:10.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#6b1426}',
      '.g-sticks{position:absolute;right:12px;top:10px;width:44px;height:44px;opacity:.9;transform:rotate(8deg)}'
    ].join('\n');
    document.head.appendChild(st);

    // Event ribbon above the existing tagline
    var ribbon = document.createElement('div');
    ribbon.className = 'g-ribbon';
    ribbon.innerHTML =
      
      '<span class="g-chip"><i></i>Garba Night Special<i></i></span>';
    header.insertBefore(ribbon, header.firstChild);

    // Sticky note at the end of the hero
    var note = document.createElement('div');
    note.id = 'garbaNote';
    note.className = 'g-note';
    note.innerHTML =
      '<svg class="g-sticks" viewBox="0 0 48 48" fill="none" stroke-linecap="round" aria-hidden="true">' +
        '<line x1="8" y1="40" x2="38" y2="10" stroke="#7a1d33" stroke-width="5"/>' +
        '<line x1="40" y1="40" x2="10" y2="10" stroke="#7a1d33" stroke-width="5"/>' +
        '<line x1="14" y1="34" x2="18" y2="30" stroke="#e0a93b" stroke-width="5"/>' +
        '<line x1="34" y1="34" x2="30" y2="30" stroke="#e0a93b" stroke-width="5"/>' +
      '</svg>' +
      '<h3>Make your Garba Night<br>unforgettable!</h3>' +
      '<p>Turn tonight&rsquo;s twirls into Polaroids you can keep forever. Add your photos, write your caption and pay on delivery.</p>' +
      '<div class="g-meta">14.11.2026 &middot; 5:30 onwards &middot; SoE Field</div>';
    header.appendChild(note);

    // submitOrder() reads these two fields; make sure they exist so it never throws
    ['custDirections', 'mapLinkInput'].forEach(function (id) {
      if (!document.getElementById(id)) {
        var i = document.createElement('input');
        i.type = 'hidden'; i.id = id; i.value = '';
        document.body.appendChild(i);
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
