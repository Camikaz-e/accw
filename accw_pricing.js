/**
 * accw_pricing.js
 * JavaScript for ACCW Pole Pricing & Proforma Invoice page
 * Arusha Concrete and Cement Works Limited
 */

/* ═══════════════════════════════════════════════
   1. CUSTOM CURSOR
═══════════════════════════════════════════════ */
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  document.addEventListener('mousemove', function(e) {
    dot.style.left  = e.clientX + 'px';
    dot.style.top   = e.clientY + 'px';
    ring.style.left = e.clientX + 'px';
    ring.style.top  = e.clientY + 'px';
  });

  document.querySelectorAll('a, button, [role="button"]').forEach(function(el) {
    el.addEventListener('mouseenter', function() {
      ring.style.transform = 'translate(-50%,-50%) scale(1.6)';
      ring.style.opacity   = '0.8';
    });
    el.addEventListener('mouseleave', function() {
      ring.style.transform = 'translate(-50%,-50%) scale(1)';
      ring.style.opacity   = '0.5';
    });
  });
})();


/* ═══════════════════════════════════════════════
   2. SCROLL PROGRESS BAR
═══════════════════════════════════════════════ */
(function initScrollProgress() {
  var bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', function() {
    var s = document.documentElement.scrollTop || document.body.scrollTop;
    var h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    bar.style.width = (s / h * 100) + '%';
  }, { passive: true });
})();


/* ═══════════════════════════════════════════════
   3. BACK-TO-TOP BUTTON
═══════════════════════════════════════════════ */
(function initBackToTop() {
  var btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', function() {
    if (window.scrollY > 600) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  }, { passive: true });
})();


/* ═══════════════════════════════════════════════
   4. MOBILE NAV HAMBURGER
═══════════════════════════════════════════════ */
(function initMobileNav() {
  var toggle  = document.getElementById('navToggle');
  var menu    = document.getElementById('mobileMenu');
  var overlay = document.getElementById('menuOverlay');
  if (!toggle || !menu || !overlay) return;

  function openMenu() {
    menu.classList.add('open');
    overlay.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    menu.classList.remove('open');
    overlay.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', function() {
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });
  overlay.addEventListener('click', closeMenu);

  menu.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', closeMenu);
  });
})();


/* ═══════════════════════════════════════════════
   5. SCROLL REVEAL
═══════════════════════════════════════════════ */
(function initReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function(el) {
      el.classList.add('in');
    });
    return;
  }
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(function(el) {
    observer.observe(el);
  });
})();


/* ═══════════════════════════════════════════════
   6. ADD-TO-QUOTE (from pricing cards)
═══════════════════════════════════════════════ */
function addToQuote(poleSize, price) {
  var sizeSelect = document.getElementById('poleSize');
  var qtyInput   = document.getElementById('quantity');
  if (!sizeSelect) return;

  sizeSelect.value = poleSize;
  if (qtyInput && (!qtyInput.value || parseInt(qtyInput.value) < 1)) {
    qtyInput.value = 1;
  }
  updateCalc();
  updatePreview();

  // Smooth scroll to quote section
  var quoteSection = document.getElementById('quote');
  if (quoteSection) {
    quoteSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}


/* ═══════════════════════════════════════════════
   7. PRICING DATA
═══════════════════════════════════════════════ */
var POLE_PRICES = {
  '9M':  580000,
  '10M': 680000,
  '12M': 920000,
  '13M': 1050000,
  '15M': 1350000
};

var VAT_RATE = 0.18;


/* ═══════════════════════════════════════════════
   8. NUMBER FORMATTING
═══════════════════════════════════════════════ */
function fmtTSh(amount) {
  if (isNaN(amount)) return 'TSh —';
  return 'TSh ' + Math.round(amount).toLocaleString('en-US');
}

function fmtNum(n) {
  if (isNaN(n)) return '—';
  return Math.round(n).toLocaleString('en-US');
}


/* ═══════════════════════════════════════════════
   9. LIVE CALCULATION
═══════════════════════════════════════════════ */
function updateCalc() {
  var sizeVal  = document.getElementById('poleSize').value;
  var qtyVal   = parseInt(document.getElementById('quantity').value);
  var unitPrice = POLE_PRICES[sizeVal] || 0;

  var calcSelected = document.getElementById('calcSelected');
  var calcQty      = document.getElementById('calcQty');
  var calcSub      = document.getElementById('calcSub');
  var calcVat      = document.getElementById('calcVat');
  var calcGrand    = document.getElementById('calcGrand');

  if (!sizeVal || !qtyVal || qtyVal < 1 || !unitPrice) {
    if (calcSelected) calcSelected.textContent = '—';
    if (calcQty)      calcQty.textContent      = '—';
    if (calcSub)      calcSub.textContent      = 'TSh —';
    if (calcVat)      calcVat.textContent      = 'TSh —';
    if (calcGrand)    calcGrand.textContent    = 'TSh —';
    return;
  }

  var subtotal   = unitPrice * qtyVal;
  var vatAmount  = subtotal * VAT_RATE;
  var grandTotal = subtotal + vatAmount;

  if (calcSelected) calcSelected.textContent = sizeVal + ' pole @ TSh ' + fmtNum(unitPrice);
  if (calcQty)      calcQty.textContent      = qtyVal + ' pole' + (qtyVal !== 1 ? 's' : '');
  if (calcSub)      calcSub.textContent      = fmtTSh(subtotal);
  if (calcVat)      calcVat.textContent      = fmtTSh(vatAmount);
  if (calcGrand)    calcGrand.textContent    = fmtTSh(grandTotal);
}


/* ═══════════════════════════════════════════════
   10. LIVE PREVIEW UPDATE
═══════════════════════════════════════════════ */
function updatePreview() {
  // Date
  var today = new Date();
  var dd = String(today.getDate()).padStart(2,'0');
  var mm = String(today.getMonth()+1).padStart(2,'0');
  var yyyy = today.getFullYear();
  var dateStr = dd + '/' + mm + '/' + yyyy;

  // Invoice number
  var rand = String(Math.floor(Math.random() * 900) + 100);
  var invNo = 'PI-' + yyyy + mm + dd + '-' + rand;

  setText('pvDate',     dateStr);
  setText('pvInvNo',    invNo);

  // Customer
  setText('pvCustName', getVal('custName') || '—');
  setText('pvCustRef',  getVal('custRef')  || '—');
  setText('pvCustVrn',  getVal('custVrn')  || '—');

  // Order
  var sizeVal   = document.getElementById('poleSize').value;
  var qtyVal    = parseInt(document.getElementById('quantity').value);
  var classVal  = getVal('poleClass') || '75SC';
  var unitPrice = POLE_PRICES[sizeVal] || 0;

  setText('pvPoleSize',  sizeVal  || '—');
  setText('pvPoleClass', classVal || '75SC');
  setText('pvQty',       qtyVal   || '—');

  if (sizeVal && qtyVal && unitPrice) {
    var subtotal   = unitPrice * qtyVal;
    var vatAmount  = subtotal * VAT_RATE;
    var grandTotal = subtotal + vatAmount;

    setText('pvUnitPrice', 'TSh ' + fmtNum(unitPrice));
    setText('pvLineTotal', 'TSh ' + fmtNum(subtotal));
    setText('pvSubTotal',  fmtTSh(subtotal));
    setText('pvVat',       fmtTSh(vatAmount));
    setText('pvGrandTotal', fmtTSh(grandTotal));
  } else {
    setText('pvUnitPrice',  '—');
    setText('pvLineTotal',  '—');
    setText('pvSubTotal',   'TSh —');
    setText('pvVat',        'TSh —');
    setText('pvGrandTotal', 'TSh —');
  }
}

function setText(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = val;
}
function getVal(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
}


/* ═══════════════════════════════════════════════
   11. BIND FORM EVENTS
═══════════════════════════════════════════════ */
(function bindFormEvents() {
  var formInputs = [
    'custName','custRef','custVrn','contactPerson','contactPhone',
    'custEmail','deliveryLoc','poleSize','poleClass','quantity','notes'
  ];
  formInputs.forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', function() {
      updateCalc();
      updatePreview();
    });
    el.addEventListener('change', function() {
      updateCalc();
      updatePreview();
    });
  });

  // Initial update
  updateCalc();
  updatePreview();
})();


/* ═══════════════════════════════════════════════
   12. FORM VALIDATION
═══════════════════════════════════════════════ */
function validateForm() {
  var valid = true;

  // Customer name
  var cname = document.getElementById('custName');
  var fgCname = document.getElementById('fg-cname');
  if (fgCname) {
    if (!cname || !cname.value.trim()) {
      fgCname.classList.add('has-error');
      valid = false;
    } else {
      fgCname.classList.remove('has-error');
    }
  }

  // Pole size
  var psize = document.getElementById('poleSize');
  var fgSize = document.getElementById('fg-polesize');
  if (fgSize) {
    if (!psize || !psize.value) {
      fgSize.classList.add('has-error');
      valid = false;
    } else {
      fgSize.classList.remove('has-error');
    }
  }

  // Quantity
  var qty = document.getElementById('quantity');
  var fgQty = document.getElementById('fg-qty');
  if (fgQty) {
    var qtyVal = parseInt(qty ? qty.value : 0);
    if (!qty || isNaN(qtyVal) || qtyVal < 1) {
      fgQty.classList.add('has-error');
      valid = false;
    } else {
      fgQty.classList.remove('has-error');
    }
  }

  return valid;
}


/* ═══════════════════════════════════════════════
   13. GENERATE & DOWNLOAD PROFORMA INVOICE
═══════════════════════════════════════════════ */
function downloadProforma() {
  if (!validateForm()) {
    // Scroll to first error
    var firstError = document.querySelector('.fgroup.has-error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Gather values
  var custName   = getVal('custName');
  var custRef    = getVal('custRef');
  var custVrn    = getVal('custVrn');
  // var custEmail  = getVal('custEmail'); // Email removed
  var custPhone  = getVal('contactPhone');
  var contactPerson = getVal('contactPerson');
  var deliveryLoc   = getVal('deliveryLoc');
  var sizeVal    = document.getElementById('poleSize').value;
  var poleClass  = getVal('poleClass') || '75SC';
  var qtyVal     = parseInt(document.getElementById('quantity').value);
  var notes      = getVal('notes');

  var unitPrice  = POLE_PRICES[sizeVal];
  var subtotal   = unitPrice * qtyVal;
  var vatAmount  = subtotal * VAT_RATE;
  var grandTotal = subtotal + vatAmount;

  // Date & Invoice number
  var today = new Date();
  var dd   = String(today.getDate()).padStart(2,'0');
  var mm   = String(today.getMonth()+1).padStart(2,'0');
  var yyyy = today.getFullYear();
  var dateStr = dd + '/' + mm + '/' + yyyy;
  var rand    = String(Math.floor(Math.random() * 900) + 100);
  var invNo   = 'PI-' + yyyy + mm + dd + '-' + rand;

  var logoUrl = 'LOGO.png'; // Use local logo file

  // Watermark SVG
  var watermarkSvg = `
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:0;opacity:0.04">
      <img src="${logoUrl}" alt="" style="width:300px;height:300px;object-fit:contain"/>
    </div>`;

  var notesRow = notes
    ? `<tr><td colspan="2" style="padding:8px;border:1px solid #ccc;"><strong>Notes:</strong> ${escHtml(notes)}</td></tr>`
    : '';

  var contactRow = (contactPerson || custPhone || deliveryLoc)
    ? `<tr>
        <td colspan="4" style="padding:8px 10px;border:1px solid #ccc;font-size:0.78rem;color:#555">
          ${contactPerson ? '<strong>Contact:</strong> ' + escHtml(contactPerson) + '  ' : ''}
          ${custPhone     ? '<strong>Tel:</strong> '     + escHtml(custPhone)     + '  ' : ''}
          ${deliveryLoc   ? '<strong>Delivery:</strong> '+ escHtml(deliveryLoc)         : ''}
        </td>
      </tr>`
    : '';

  var invoiceHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>ACCW Proforma Invoice ${invNo}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box }
    body { font-family:'Times New Roman',Times,serif; background:#fff; color:#1a1a1a; padding:24px }
    @media print {
      body { padding: 10px }
      .no-print { display:none !important }
      @page { margin: 15mm }
    }
  </style>
</head>
<body>

  <!-- Print button (hidden on print) -->
  <div class="no-print" style="text-align:right;margin-bottom:16px">
    <button onclick="window.print()" style="
      font-family:Arial,sans-serif;font-size:0.85rem;font-weight:700;
      letter-spacing:2px;text-transform:uppercase;
      padding:0.7rem 2rem;background:#060e1c;color:#fff;
      border:none;cursor:pointer;border-radius:3px">
      ⬇ Save as PDF / Print
    </button>
  </div>

  <div style="font-family:'Times New Roman',Times,serif;max-width:740px;margin:0 auto;color:#1a1a1a;position:relative;">
    ${watermarkSvg}
    <div style="position:relative;z-index:1;">

      <!-- Page Title -->
      <h1 style="text-align:center;font-size:1.5rem;letter-spacing:0.1em;margin-bottom:18px;
                 border-bottom:2px solid #1a1a1a;padding-bottom:10px;font-family:Arial,sans-serif">
        PROFORMA INVOICE
      </h1>

      <!-- Header table -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:14px">
        <tr>
          <td style="width:55%;vertical-align:top;padding-right:14px">
            <div style="border:1px solid #ccc;padding:10px;font-size:0.82rem;display:flex;align-items:center;gap:10px">
              <div style="flex-shrink:0">
                <img src="${logoUrl}" alt="ACCW Logo"
                  style="width:56px;height:56px;border-radius:50%;object-fit:cover;
                         border:1px solid #ccc;display:block"/>
              </div>
              <div>
                <strong style="font-size:0.9rem">Arusha Concrete &amp; Cement Works Ltd</strong><br/>
                P.O.Box 952, Arusha, Tanzania<br/>
                Tel: 0754 420 577 / 0764 686 840<br/>
                Email: arushaconc@gmail.com
              </div>
            </div>
            <div style="border:1px solid #ccc;border-top:none;font-size:0.78rem">
              <table style="width:100%;border-collapse:collapse;margin:0">
                <tr>
                  <td style="padding:6px 10px;width:50%;border-right:1px solid #ccc"><strong>VRN: 40-313230-L</strong></td>
                  <td style="padding:6px 10px;width:50%"><strong>TIN:</strong> 131-668-376</td>
                </tr>
              </table>
            </div>
          </td>
          <td style="vertical-align:top">
            <table style="border-collapse:collapse;width:100%;font-size:0.82rem">
              <tr>
                <td colspan="2" style="text-align:center;padding:8px;border:1px solid #ccc;
                    font-weight:bold;background:#f0f0f0;letter-spacing:3px;font-size:0.85rem">
                  PROFORMA INVOICE
                </td>
              </tr>
              <tr>
                <td style="padding:7px 10px;border:1px solid #ccc;background:#f8f8f8">Date</td>
                <td style="padding:7px 10px;border:1px solid #ccc">${dateStr}</td>
              </tr>
              <tr>
                <td style="padding:7px 10px;border:1px solid #ccc;background:#f8f8f8">Currency</td>
                <td style="padding:7px 10px;border:1px solid #ccc">TSh</td>
              </tr>
              <tr>
                <td style="padding:7px 10px;border:1px solid #ccc;background:#f8f8f8">Invoice No.</td>
                <td style="padding:7px 10px;border:1px solid #ccc;font-weight:bold"></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Customer table -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:14px;font-size:0.82rem">
        <thead>
          <tr style="background:#f5f5f5">
            <th style="padding:7px 10px;border:1px solid #ccc;text-align:left">Customer Name</th>
            <th style="padding:7px 10px;border:1px solid #ccc;text-align:left">Customer Reference</th>
            <th style="padding:7px 10px;border:1px solid #ccc;text-align:left">Customer VRN</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:9px 10px;border:1px solid #ccc;font-weight:600">${escHtml(custName)}</td>
            <td style="padding:9px 10px;border:1px solid #ccc">${escHtml(custRef)}</td>
            <td style="padding:9px 10px;border:1px solid #ccc">${escHtml(custVrn)}</td>
          </tr>
          
        </tbody>
      </table>

      <!-- Line items table -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:6px;font-size:0.82rem">
        <thead>
          <tr style="background:#f5f5f5">
            <th style="padding:9px 8px;border:1px solid #1a1a1a;text-align:left">S/No</th>
            <th style="padding:9px 8px;border:1px solid #1a1a1a;text-align:left">Pole Size</th>
            <th style="padding:9px 8px;border:1px solid #1a1a1a;text-align:left">Class</th>
            <th style="padding:9px 8px;border:1px solid #1a1a1a;text-align:center">Quantity</th>
            <th style="padding:9px 8px;border:1px solid #1a1a1a;text-align:right">Unit Price (TSh)</th>
            <th style="padding:9px 8px;border:1px solid #1a1a1a;text-align:right">Total (TSh)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:9px 8px;border:1px solid #1a1a1a;text-align:center">1</td>
            <td style="padding:9px 8px;border:1px solid #1a1a1a;font-weight:600">${escHtml(sizeVal)} Prestressed Spun Concrete Pole</td>
            <td style="padding:9px 8px;border:1px solid #1a1a1a">${escHtml(poleClass)}</td>
            <td style="padding:9px 8px;border:1px solid #1a1a1a;text-align:center">${qtyVal}</td>
            <td style="padding:9px 8px;border:1px solid #1a1a1a;text-align:right">${fmtNum(unitPrice)}</td>
            <td style="padding:9px 8px;border:1px solid #1a1a1a;text-align:right">${fmtNum(subtotal)}</td>
          </tr>
          <tr>
            <td colspan="5" style="padding:9px 8px;border:1px solid #1a1a1a;text-align:right">Sub-Total</td>
            <td style="padding:9px 8px;border:1px solid #1a1a1a;text-align:right">${fmtNum(subtotal)}</td>
          </tr>
          <tr>
            <td colspan="5" style="padding:9px 8px;border:1px solid #1a1a1a;text-align:right">VAT 18%</td>
            <td style="padding:9px 8px;border:1px solid #1a1a1a;text-align:right">${fmtNum(vatAmount)}</td>
          </tr>
          <tr>
            <td colspan="5" style="padding:9px 8px;border:1px solid #1a1a1a;text-align:right;font-weight:bold">Grand-Total</td>
            <td style="padding:9px 8px;border:1px solid #1a1a1a;text-align:right;font-weight:bold;font-style:italic;font-size:1rem">${fmtNum(grandTotal)}</td>
          </tr>
        </tbody>
      </table>

      <!-- Transport note -->
      <div style="margin:12px 0;padding:10px 14px;background:#fffbe6;
                  border:1px solid #e8c840;border-left:4px solid #c8a800;font-size:0.78rem">
        <strong>⚠ TRANSPORT NOTE:</strong>
        Transport and delivery fees are <strong>NOT included</strong> in this proforma invoice.
        Fees are subject to negotiation based on delivery location.
        Please contact us to arrange delivery:
        <strong>Tel: 0754 420 577 / 0764 686 840</strong>
      </div>

      ${notes ? `
      <!-- Notes -->
      <div style="margin-bottom:12px;padding:10px 14px;background:#f9f9f9;border:1px solid #ddd;font-size:0.80rem">
        <strong>Notes / Special Instructions:</strong><br/>
        ${escHtml(notes)}
      </div>` : ''}

      <!-- Delivery location if provided -->
      ${deliveryLoc ? `
      <div style="margin-bottom:12px;padding:8px 14px;background:#f9f9f9;border:1px solid #ddd;font-size:0.78rem">
        <strong>Delivery Location:</strong> ${escHtml(deliveryLoc)}
      </div>` : ''}

      <!-- Prepared by -->
      <table style="border-collapse:collapse;margin:40px auto 0;font-size:0.78rem;width:70%">
        <tr>
          <td style="border:1px solid #ccc;padding:9px 14px;width:60%">Prepared By: Abdulrahim Gaher</td>
          <td style="border:1px solid #ccc;padding:9px 14px">Date: ${dateStr}</td>
        </tr>
      </table>

      <!-- Bank details -->
      <table style="width:70%;border-collapse:collapse;margin:20px auto 0;font-size:0.78rem">
        <tr>
          <td style="border:1px solid #ccc;padding:10px;vertical-align:top;width:50%">
            <strong>BANKERS:</strong><br/>
            ARUSHA CONCRETE &amp; CEMENT WORKS<br/>
            <strong><em>CRDB BANK — TSh Account</em></strong><br/>
            Abdulrahim Gaher<br/>
            <strong><em>0152596894901</em></strong>
          </td>
          <td style="border:1px solid #ccc;padding:10px;vertical-align:top">
            <strong>CONTACTS:</strong><br/>
            Plant Manager: 0786168162<br/>
            CEO: 0764 686 840<br/>
            Email: arushaconc@gmail.com
          </td>
        </tr>
      </table>

      <!-- Legal note -->
      <p style="text-align:center;margin-top:18px;font-size:0.7rem;color:#888;font-style:italic">
        This is a proforma invoice and not a tax invoice.
        Final tax invoice will be issued upon order confirmation.
      </p>

    </div>
  </div>

  <script>
    window.onload = function() { window.print(); };
  <\/script>
</body>
</html>`;

  // Open in new window and print
  var win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    alert('Please allow popups for this page to download your proforma invoice.');
    return;
  }
  win.document.write(invoiceHTML);
  win.document.close();
}


/* ═══════════════════════════════════════════════
   14. RESET FORM
═══════════════════════════════════════════════ */
function resetForm() {
  var form = document.getElementById('quoteForm');
  if (!form) return;

  form.querySelectorAll('input').forEach(function(el) {
    if (el.name === 'poleClass') {
      el.value = '75SC';
    } else if (el.name === 'quantity') {
      el.value = '1';
    } else {
      el.value = '';
    }
  });
  form.querySelectorAll('select').forEach(function(el) { el.value = '' });
  form.querySelectorAll('textarea').forEach(function(el) { el.value = '' });

  // Clear error states
  form.querySelectorAll('.fgroup.has-error').forEach(function(el) {
    el.classList.remove('has-error');
  });

  updateCalc();
  updatePreview();
}


/* ═══════════════════════════════════════════════
   15. HTML ESCAPE HELPER
═══════════════════════════════════════════════ */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


/* ═══════════════════════════════════════════════
   16. INITIAL INVOICE DATE & NUMBER
═══════════════════════════════════════════════ */
(function setInitialDateAndNumber() {
  var today = new Date();
  var dd   = String(today.getDate()).padStart(2,'0');
  var mm   = String(today.getMonth()+1).padStart(2,'0');
  var yyyy = today.getFullYear();
  var dateStr = dd + '/' + mm + '/' + yyyy;
  var rand    = String(Math.floor(Math.random() * 900) + 100);
  var invNo   = 'PI-' + yyyy + mm + dd + '-' + rand;

  var pvDate  = document.getElementById('pvDate');
  var pvInvNo = document.getElementById('pvInvNo');
  if (pvDate)  pvDate.textContent  = dateStr;
  if (pvInvNo) pvInvNo.textContent = invNo;
})();
