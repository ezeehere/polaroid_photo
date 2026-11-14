/* Mobile + speed add-on. Add <script src="enhance.js"></script> after garba.js, just before </body>. */
(function () {
  // ===== SET THIS: your WhatsApp number with country code, digits only (e.g. '919876543210'). Leave '' to hide the button. =====
  var WHATSAPP_NUMBER = '';
  var MAX_PX = 2400; // longest side of uploaded photos (still sharp for Polaroid prints)

  var TITLES = ['Garba Nite', 'Dandiya Raas', 'Navratri Vibes', 'Twirl Mode', 'Raas Queen'];
  var SUBS = ['Garba Night 2026', 'Tonight we dance', 'Dhol bajne do', 'Raat bhar raas', 'Memories on repeat'];

  /* ---------- CSS ---------- */
  var st = document.createElement('style');
  st.textContent = [
    'html{-webkit-text-size-adjust:100%}',
    'button,label,a,.q-chip{touch-action:manipulation}',
    '.q-chips{display:flex;gap:6px;overflow-x:auto;padding:1px 0 3px;scrollbar-width:none;-webkit-overflow-scrolling:touch;width:100%;max-width:100%;box-sizing:border-box}',
    '#cardsContainer .flex-1{min-width:0}', // lets the chip rows scroll instead of stretching the card
    'body{overflow-x:hidden}',
    '.q-chips::-webkit-scrollbar{display:none}',
    '.q-chip{flex:0 0 auto;padding:7px 12px;border-radius:999px;border:1px solid var(--line);background:rgba(216,176,106,.12);color:var(--gold2);font-size:12px;font-weight:600;white-space:nowrap;line-height:1}',
    '.q-chip:active{background:var(--gold);color:var(--ink)}',
    '.bar.kb-open{display:none!important}',
    '#waBtn{display:block;text-align:center;padding:13px;border-radius:12px;border:1px solid var(--gold);color:var(--gold2);font-weight:600;font-size:14px;text-decoration:none}',
    '@media(max-width:640px){',
    ' input,textarea,select{font-size:16px!important}', // stops iOS zoom-on-focus
    ' button[onclick^="rotatePhoto"],button[onclick^="rotateText"],button[onclick^="removePhoto"]{min-height:36px;padding:6px 12px!important;font-size:12px!important}',
    ' #livePreviewGrid button{min-height:34px}',
    ' #submitBtn,#jumpPreviewBtn{min-height:48px}',
    '}'
  ].join('\n');
  document.head.appendChild(st);

  /* ---------- 1. Compress photos before upload ---------- */
  window.getUploadBase64 = function (item) {
    var file = item._origFile || (item._origFile = item.file);
    var rot = item.rotation || 0;
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight, big = Math.max(w, h) > MAX_PX;
        if (!rot && !big && file.size < 1500000) {
          item.file = file;
          return fileToBase64(file).then(resolve);
        }
        var s = big ? MAX_PX / Math.max(w, h) : 1;
        var dw = Math.round(w * s), dh = Math.round(h * s), swap = rot === 90 || rot === 270;
        var c = document.createElement('canvas');
        c.width = swap ? dh : dw; c.height = swap ? dw : dh;
        var x = c.getContext('2d');
        x.translate(c.width / 2, c.height / 2);
        x.rotate(rot * Math.PI / 180);
        x.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        var png = file.type === 'image/png', type = png ? 'image/png' : 'image/jpeg';
        c.toBlob(function (b) {
          if (!b) return fileToBase64(file).then(resolve);
          var base = (file.name || 'photo').replace(/\.[^.]+$/, '');
          item.file = new File([b], base + (png ? '.png' : '.jpg'), { type: type }); // keeps mimeType in sync
          fileToBase64(item.file).then(resolve);
        }, type, 0.9);
      };
      img.onerror = function () { fileToBase64(file).then(resolve); };
      img.src = item.previewUrl;
    });
  };

  /* ---------- 2. Quick caption chips ---------- */
  function chipRow(list, id, field, input) {
    var row = document.createElement('div');
    row.className = 'q-chips';
    list.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'q-chip'; b.textContent = t;
      b.addEventListener('click', function () { input.value = t; updateItemField(id, field, t); });
      row.appendChild(b);
    });
    return row;
  }
  function addChips() {
    document.querySelectorAll('#cardsContainer input[oninput*="\'title\'"]').forEach(function (ti) {
      var wrap = ti.parentNode;
      if (wrap.querySelector('.q-chips')) return;
      var m = ti.getAttribute('oninput').match(/updateItemField\('([^']+)'/);
      var si = wrap.querySelector('input[oninput*="\'subtitle\'"]');
      if (!m || !si) return;
      si.parentNode.insertBefore(chipRow(SUBS, m[1], 'subtitle', si), si.nextSibling);
      ti.parentNode.insertBefore(chipRow(TITLES, m[1], 'title', ti), ti.nextSibling);
    });
  }
  var _renderCards = window.renderCards;
  window.renderCards = function () { _renderCards.apply(this, arguments); addChips(); };

  /* ---------- 3. Form polish for phones ---------- */
  function polishForm() {
    var phone = document.getElementById('custPhone'), name = document.getElementById('custName'), addr = document.getElementById('custAddress');
    if (phone) {
      phone.setAttribute('inputmode', 'numeric'); phone.setAttribute('autocomplete', 'tel'); phone.setAttribute('enterkeyhint', 'next');
      phone.removeAttribute('maxlength'); // autofill like "+91 98765 43210" was being cut off
      phone.addEventListener('input', function () {
        var d = this.value.replace(/\D/g, '');
        if (d.length > 10) d = d.replace(/^(91|0)/, '');
        this.value = d.slice(0, 10);
      });
    }
    if (name) { name.setAttribute('autocomplete', 'name'); name.setAttribute('enterkeyhint', 'next'); }
    if (addr) addr.setAttribute('autocomplete', 'street-address');
    document.querySelectorAll('label').forEach(function (l) {
      if (/^Phone Number/.test(l.textContent.trim())) l.textContent = 'WhatsApp Number (for COD confirmation) *';
    });
  }

  /* ---------- 4. Hide checkout bar while the keyboard is open ---------- */
  var bar = document.querySelector('.bar');
  function isField(el) { return el && /^(INPUT|TEXTAREA)$/.test(el.tagName) && el.type !== 'radio' && el.type !== 'file'; }
  document.addEventListener('focusin', function (e) {
    if (bar && isField(e.target) && window.matchMedia('(max-width:768px)').matches) bar.classList.add('kb-open');
  });
  document.addEventListener('focusout', function () {
    setTimeout(function () { if (bar && !isField(document.activeElement)) bar.classList.remove('kb-open'); }, 120);
  });

  /* ---------- 5. WhatsApp button on the success popup ---------- */
  var modal = document.getElementById('successModal');
  if (modal && WHATSAPP_NUMBER) {
    new MutationObserver(function () {
      if (modal.classList.contains('hidden') || document.getElementById('waBtn')) return;
      var id = document.getElementById('confirmedOrderId').textContent;
      var amt = document.getElementById('confirmedAmount').textContent;
      var who = (document.getElementById('custName') || {}).value || '';
      var msg = 'Hi! I just placed a COD order. Order ID: ' + id + ', Amount: ' + amt + (who ? ', Name: ' + who : '') + '.';
      var a = document.createElement('a');
      a.id = 'waBtn'; a.target = '_blank'; a.rel = 'noopener';
      a.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
      a.textContent = 'Message us on WhatsApp';
      var btn = modal.querySelector('button');
      btn.parentNode.insertBefore(a, btn);
    }).observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  polishForm();
})();