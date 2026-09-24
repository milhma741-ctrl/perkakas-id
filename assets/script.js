/* ==========================================================================
   PERKAKAS.ID — assets/script.js
   Dipakai bersama di semua halaman (multi-page, bukan SPA).
   Setiap fungsi tool dijaga dengan pengecekan elemen (if (el) {...}),
   sehingga aman dimuat di halaman mana pun meski elemennya tidak ada.
   ========================================================================== */

'use strict';

document.addEventListener('DOMContentLoaded', function () {

  /* ========================================================================
     1. SIDEBAR MOBILE (BUKA / TUTUP)
  ======================================================================== */

  var sidebar = document.getElementById('sidebar');
  var sidebarOverlay = document.getElementById('sidebar-overlay');
  var sidebarOpenBtn = document.getElementById('sidebar-open');
  var sidebarCloseBtn = document.getElementById('sidebar-close');

  function openSidebar() {
    if (!sidebar || !sidebarOverlay) return;
    sidebar.classList.remove('-translate-x-full');
    sidebarOverlay.classList.remove('hidden');
  }

  function closeSidebar() {
    if (!sidebar || !sidebarOverlay) return;
    sidebar.classList.add('-translate-x-full');
    sidebarOverlay.classList.add('hidden');
  }

  if (sidebarOpenBtn) sidebarOpenBtn.addEventListener('click', openSidebar);
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);


  /* ========================================================================
     2. PENCARIAN TOOL DI SIDEBAR (navigasi ke halaman asli)
  ======================================================================== */

  var toolSearch = document.getElementById('tool-search');

  if (toolSearch) {
    var toolLinks = Array.prototype.slice.call(document.querySelectorAll('#sidebar a[data-tool]'));

    toolSearch.addEventListener('input', function () {
      var query = toolSearch.value.trim().toLowerCase();
      toolLinks.forEach(function (link) {
        var text = link.textContent.toLowerCase();
        link.style.display = (!query || text.indexOf(query) !== -1) ? '' : 'none';
      });
    });

    toolSearch.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var query = toolSearch.value.trim().toLowerCase();
      var match = toolLinks.find(function (link) {
        return link.textContent.toLowerCase().indexOf(query) !== -1;
      });
      if (match) window.location.href = match.getAttribute('href');
    });
  }


  /* ========================================================================
     3. HELPER: SALIN KE CLIPBOARD (dipakai oleh beberapa tools)
  ======================================================================== */

  function copyToClipboard(text, onSuccess) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(function () {
        fallbackCopy(text, onSuccess);
      });
    } else {
      fallbackCopy(text, onSuccess);
    }
  }

  function fallbackCopy(text, onSuccess) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Gagal menyalin teks:', err);
    }
    document.body.removeChild(textarea);
  }

  function flashButtonText(btn, tempText, duration) {
    if (!btn) return;
    var original = btn.textContent;
    btn.textContent = tempText;
    setTimeout(function () { btn.textContent = original; }, duration || 1500);
  }

  function flashButtonIcon(btn, tempSVG, duration) {
    if (!btn) return;
    var original = btn.innerHTML;
    btn.innerHTML = tempSVG;
    setTimeout(function () { btn.innerHTML = original; }, duration || 1500);
  }

  var CHECK_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>';

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function calcReductionPct(before, after) {
    if (before <= 0) return '0%';
    var pct = ((before - after) / before) * 100;
    return (pct > 0 ? pct.toFixed(0) : '0') + '%';
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }


  /* ========================================================================
     4. TOOL #1 — KOMPRESOR & RESIZE GAMBAR (HTML5 Canvas)
  ======================================================================== */

  var imgDropzone = document.getElementById('img-dropzone');
  var imgInput = document.getElementById('img-input');
  var imgControls = document.getElementById('img-controls');
  var imgActions = document.getElementById('img-actions');
  var imgQuality = document.getElementById('img-quality');
  var imgQualityValue = document.getElementById('img-quality-value');
  var imgMaxWidth = document.getElementById('img-max-width');
  var imgCompressBtn = document.getElementById('img-compress-btn');
  var imgResult = document.getElementById('img-result');
  var imgBeforePreview = document.getElementById('img-before-preview');
  var imgAfterPreview = document.getElementById('img-after-preview');
  var imgBeforeSize = document.getElementById('img-before-size');
  var imgAfterSize = document.getElementById('img-after-size');
  var imgDownloadBtn = document.getElementById('img-download-btn');
  var imgCanvas = document.getElementById('img-canvas');

  var currentImageFile = null;
  var currentImageObjectURL = null;

  if (imgDropzone && imgInput) {
    imgDropzone.addEventListener('click', function () { imgInput.click(); });

    imgDropzone.addEventListener('dragover', function (e) {
      e.preventDefault();
      imgDropzone.classList.add('border-forest');
    });
    imgDropzone.addEventListener('dragleave', function () {
      imgDropzone.classList.remove('border-forest');
    });
    imgDropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      imgDropzone.classList.remove('border-forest');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageFile(e.dataTransfer.files[0]);
      }
    });

    imgInput.addEventListener('change', function (e) {
      if (e.target.files && e.target.files[0]) handleImageFile(e.target.files[0]);
    });
  }

  function handleImageFile(file) {
    if (!/^image\/(jpeg|png)$/.test(file.type)) {
      alert('Format tidak didukung. Silakan unggah file berformat JPG atau PNG.');
      return;
    }
    currentImageFile = file;
    imgControls.classList.remove('hidden');
    imgActions.classList.remove('hidden');
    imgResult.classList.add('hidden');
  }

  if (imgQuality) {
    imgQuality.addEventListener('input', function () {
      imgQualityValue.textContent = imgQuality.value + '%';
    });
  }

  if (imgCompressBtn) {
    imgCompressBtn.addEventListener('click', function () {
      if (!currentImageFile) return;

      imgCompressBtn.disabled = true;
      imgCompressBtn.textContent = 'Memproses…';

      var reader = new FileReader();

      reader.onload = function (e) {
        var img = new Image();

        img.onload = function () {
          var maxWidth = parseInt(imgMaxWidth.value, 10) || img.width;
          var targetWidth = img.width;
          var targetHeight = img.height;

          if (img.width > maxWidth) {
            targetWidth = maxWidth;
            targetHeight = Math.round(img.height * (maxWidth / img.width));
          }

          imgCanvas.width = targetWidth;
          imgCanvas.height = targetHeight;
          var ctx = imgCanvas.getContext('2d');
          ctx.clearRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          var quality = (parseInt(imgQuality.value, 10) || 80) / 100;

          imgCanvas.toBlob(function (blob) {
            imgCompressBtn.disabled = false;
            imgCompressBtn.textContent = 'Kompres Gambar';

            if (!blob) {
              alert('Gagal memproses gambar. Coba file lain.');
              return;
            }

            if (currentImageObjectURL) URL.revokeObjectURL(currentImageObjectURL);
            currentImageObjectURL = URL.createObjectURL(blob);

            imgBeforePreview.src = e.target.result;
            imgAfterPreview.src = currentImageObjectURL;
            imgBeforeSize.textContent = 'Ukuran: ' + formatBytes(currentImageFile.size) +
              ' · ' + img.width + '×' + img.height + 'px';
            imgAfterSize.textContent = 'Ukuran: ' + formatBytes(blob.size) +
              ' · ' + targetWidth + '×' + targetHeight + 'px (hemat ' + calcReductionPct(currentImageFile.size, blob.size) + ')';

            imgDownloadBtn.href = currentImageObjectURL;
            var originalName = currentImageFile.name.replace(/\.[^/.]+$/, '');
            imgDownloadBtn.setAttribute('download', originalName + '-compressed.jpg');

            imgResult.classList.remove('hidden');
          }, 'image/jpeg', quality);
        };

        img.onerror = function () {
          imgCompressBtn.disabled = false;
          imgCompressBtn.textContent = 'Kompres Gambar';
          alert('Gagal memuat gambar. File mungkin rusak.');
        };

        img.src = e.target.result;
      };

      reader.onerror = function () {
        imgCompressBtn.disabled = false;
        imgCompressBtn.textContent = 'Kompres Gambar';
        alert('Gagal membaca file gambar.');
      };

      reader.readAsDataURL(currentImageFile);
    });
  }


  /* ========================================================================
     5. TOOL #2 — BACA TEKS DARI DOKUMEN (.txt)
  ======================================================================== */

  var txtDropzone = document.getElementById('txt-dropzone');
  var txtInput = document.getElementById('txt-input');
  var txtResult = document.getElementById('txt-result');
  var txtOutput = document.getElementById('txt-output');
  var txtCopyBtn = document.getElementById('txt-copy-btn');

  if (txtDropzone && txtInput) {
    txtDropzone.addEventListener('click', function () { txtInput.click(); });

    txtDropzone.addEventListener('dragover', function (e) {
      e.preventDefault();
      txtDropzone.classList.add('border-forest');
    });
    txtDropzone.addEventListener('dragleave', function () {
      txtDropzone.classList.remove('border-forest');
    });
    txtDropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      txtDropzone.classList.remove('border-forest');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleTextFile(e.dataTransfer.files[0]);
      }
    });

    txtInput.addEventListener('change', function (e) {
      if (e.target.files && e.target.files[0]) handleTextFile(e.target.files[0]);
    });
  }

  function handleTextFile(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      txtOutput.value = e.target.result;
      txtResult.classList.remove('hidden');
    };
    reader.onerror = function () {
      alert('Gagal membaca file. Pastikan file berupa teks biasa (.txt).');
    };
    reader.readAsText(file, 'UTF-8');
  }

  if (txtCopyBtn) {
    txtCopyBtn.addEventListener('click', function () {
      if (!txtOutput.value) return;
      copyToClipboard(txtOutput.value, function () {
        flashButtonText(txtCopyBtn, 'Tersalin!', 1500);
      });
    });
  }


  /* ========================================================================
     6. TOOL #3 — PENGHITUNG KATA & KARAKTER + KEPADATAN KATA KUNCI
  ======================================================================== */

  var wcInput = document.getElementById('wc-input');
  var wcWords = document.getElementById('wc-words');
  var wcChars = document.getElementById('wc-chars');
  var wcSentences = document.getElementById('wc-sentences');
  var wcReadTime = document.getElementById('wc-read-time');
  var wcDensityTable = document.getElementById('wc-density-table');

  var STOPWORDS = new Set([
    'yang', 'dan', 'di', 'ke', 'dari', 'ini', 'itu', 'untuk', 'pada', 'dengan',
    'adalah', 'akan', 'atau', 'juga', 'saya', 'kamu', 'dia', 'mereka', 'kita',
    'ada', 'tidak', 'sudah', 'saja', 'karena', 'oleh', 'sebagai', 'dalam',
    'tersebut', 'dapat', 'bisa', 'lebih', 'para', 'ya', 'nya', 'kami', 'anda',
    'the', 'and', 'to', 'of', 'a', 'in', 'is', 'it', 'for', 'on', 'that', 'this', 'as', 'are'
  ]);

  function updateWordCount() {
    var text = wcInput.value;
    var trimmed = text.trim();
    var words = trimmed.length ? trimmed.split(/\s+/) : [];
    var chars = text.length;
    var sentenceMatches = trimmed.length ? trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g) : null;
    var sentences = sentenceMatches ? sentenceMatches.filter(function (s) { return s.trim().length; }) : [];
    var readMinutes = words.length ? Math.max(1, Math.ceil(words.length / 200)) : 0;

    wcWords.textContent = words.length;
    wcChars.textContent = chars;
    wcSentences.textContent = sentences.length;
    wcReadTime.textContent = readMinutes + ' mnt';

    renderDensity(words);
  }

  function renderDensity(words) {
    if (!words.length) {
      wcDensityTable.innerHTML = '<tr><td colspan="3" class="py-4 text-center text-inkmuted text-xs">Belum ada data — mulai ketik di atas.</td></tr>';
      return;
    }

    var freq = {};
    words.forEach(function (w) {
      var clean = w.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
      if (!clean || STOPWORDS.has(clean)) return;
      freq[clean] = (freq[clean] || 0) + 1;
    });

    var entries = Object.keys(freq).map(function (word) {
      return [word, freq[word]];
    }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 10);

    if (!entries.length) {
      wcDensityTable.innerHTML = '<tr><td colspan="3" class="py-4 text-center text-inkmuted text-xs">Tidak ada kata kunci signifikan yang ditemukan.</td></tr>';
      return;
    }

    var total = words.length;
    wcDensityTable.innerHTML = entries.map(function (entry) {
      var word = entry[0];
      var count = entry[1];
      var density = ((count / total) * 100).toFixed(1);
      return '<tr class="border-b border-line last:border-0">' +
        '<td class="py-2">' + escapeHTML(word) + '</td>' +
        '<td class="py-2 text-right font-mono">' + count + '</td>' +
        '<td class="py-2 text-right font-mono">' + density + '%</td>' +
        '</tr>';
    }).join('');
  }

  if (wcInput) {
    wcInput.addEventListener('input', updateWordCount);
    updateWordCount();
  }


  /* ========================================================================
     7. TOOL #4 — GENERATOR KATA SANDI KUAT
  ======================================================================== */

  var pwdOutput = document.getElementById('pwd-output');
  var pwdCopyBtn = document.getElementById('pwd-copy-btn');
  var pwdStrengthLabel = document.getElementById('pwd-strength-label');
  var pwdStrengthBar = document.getElementById('pwd-strength-bar');
  var pwdLength = document.getElementById('pwd-length');
  var pwdLengthValue = document.getElementById('pwd-length-value');
  var pwdUppercase = document.getElementById('pwd-uppercase');
  var pwdLowercase = document.getElementById('pwd-lowercase');
  var pwdNumbers = document.getElementById('pwd-numbers');
  var pwdSymbols = document.getElementById('pwd-symbols');
  var pwdGenerateBtn = document.getElementById('pwd-generate-btn');

  var PWD_CHARSETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  function generatePassword() {
    var length = parseInt(pwdLength.value, 10);
    var pool = '';

    if (pwdUppercase.checked) pool += PWD_CHARSETS.uppercase;
    if (pwdLowercase.checked) pool += PWD_CHARSETS.lowercase;
    if (pwdNumbers.checked) pool += PWD_CHARSETS.numbers;
    if (pwdSymbols.checked) pool += PWD_CHARSETS.symbols;

    if (!pool) {
      alert('Pilih minimal satu jenis karakter untuk membuat kata sandi.');
      return;
    }

    var randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    var password = '';
    for (var i = 0; i < length; i++) {
      password += pool[randomValues[i] % pool.length];
    }

    pwdOutput.value = password;
    updatePasswordStrength(password, length);
  }

  function updatePasswordStrength(password, length) {
    var score = 0;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (length >= 12) score++;
    if (length >= 20) score++;

    var label, color, widthPct;
    if (score <= 2) {
      label = 'Lemah'; color = '#D9534F'; widthPct = 30;
    } else if (score <= 4) {
      label = 'Sedang'; color = '#E8A33D'; widthPct = 65;
    } else {
      label = 'Kuat'; color = '#2F6F4E'; widthPct = 100;
    }

    pwdStrengthLabel.textContent = 'Kekuatan: ' + label;
    pwdStrengthBar.style.width = widthPct + '%';
    pwdStrengthBar.style.backgroundColor = color;
  }

  if (pwdLength) {
    pwdLength.addEventListener('input', function () {
      pwdLengthValue.textContent = pwdLength.value;
    });
  }

  if (pwdGenerateBtn) {
    pwdGenerateBtn.addEventListener('click', generatePassword);
  }

  if (pwdCopyBtn) {
    pwdCopyBtn.addEventListener('click', function () {
      if (!pwdOutput.value || pwdOutput.value.indexOf('Klik') === 0) return;
      copyToClipboard(pwdOutput.value, function () {
        flashButtonIcon(pwdCopyBtn, CHECK_ICON, 1500);
      });
    });
  }


  /* ========================================================================
     8. TOOL #5 — PEMILIH WARNA & GENERATOR PALET
  ======================================================================== */

  var colorInput = document.getElementById('color-input');
  var colorHex = document.getElementById('color-hex');
  var colorRgb = document.getElementById('color-rgb');
  var colorHsl = document.getElementById('color-hsl');
  var colorPalette = document.getElementById('color-palette');

  function hexToRgb(hex) {
    var clean = hex.replace('#', '');
    var bigint = parseInt(clean, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0;
    var l = (max + min) / 2;

    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    var k = function (n) { return (n + h / 30) % 12; };
    var a = s * Math.min(l, 1 - l);
    var f = function (n) {
      return l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    };
    var toHex = function (x) { return Math.round(255 * x).toString(16).padStart(2, '0'); };
    return '#' + toHex(f(0)) + toHex(f(8)) + toHex(f(4));
  }

  function updateColor() {
    var hex = colorInput.value;
    var rgb = hexToRgb(hex);
    var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    colorHex.value = hex.toUpperCase();
    colorRgb.value = 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
    colorHsl.value = 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)';

    renderPalette(hsl);
  }

  function renderPalette(hsl) {
    var variants = [
      { label: 'Utama', h: hsl.h, s: hsl.s, l: hsl.l },
      { label: 'Analog +30°', h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l },
      { label: 'Analog -30°', h: (hsl.h + 330) % 360, s: hsl.s, l: hsl.l },
      { label: 'Komplementer', h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l },
      { label: 'Versi Terang', h: hsl.h, s: hsl.s, l: Math.min(92, hsl.l + 25) }
    ];

    colorPalette.innerHTML = variants.map(function (v) {
      var hex = hslToHex(v.h, v.s, v.l);
      return '<button type="button" data-hex="' + hex + '" title="Klik untuk salin ' + hex + '" ' +
        'class="palette-swatch text-left rounded-lg overflow-hidden border border-line hover:shadow-card transition-shadow">' +
        '<span class="block h-14" style="background:' + hex + '"></span>' +
        '<span class="block px-2 py-1.5 text-[10px] font-mono text-inkmuted bg-panel">' + hex + '</span>' +
        '</button>';
    }).join('');

    colorPalette.querySelectorAll('.palette-swatch').forEach(function (btn) {
      btn.addEventListener('click', function () {
        copyToClipboard(btn.getAttribute('data-hex'), function () {
          var label = btn.querySelector('span:last-child');
          var original = label.textContent;
          label.textContent = 'Tersalin!';
          setTimeout(function () { label.textContent = original; }, 1200);
        });
      });
    });
  }

  if (colorInput) {
    colorInput.addEventListener('input', updateColor);

    [colorHex, colorRgb, colorHsl].forEach(function (field) {
      if (!field) return;
      field.addEventListener('click', function () {
        copyToClipboard(field.value, function () {
          var original = field.value;
          field.value = 'Tersalin!';
          setTimeout(function () { field.value = original; }, 1000);
        });
      });
    });

    updateColor();
  }


  /* ========================================================================
     9. FORM KONTAK (DEMO STATIS, TANPA BACKEND)
  ======================================================================== */

  var contactForm = document.getElementById('contact-form');
  var contactSubmitBtn = document.getElementById('contact-submit-btn');
  var contactNote = document.getElementById('contact-note');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('contact-name').value.trim();
      var email = document.getElementById('contact-email').value.trim();
      var message = document.getElementById('contact-message').value.trim();

      if (!name || !email || !message) {
        contactNote.textContent = 'Mohon lengkapi semua kolom sebelum mengirim.';
        contactNote.classList.add('text-amber-dark');
        return;
      }

      contactNote.classList.remove('text-amber-dark');
      contactNote.textContent = 'Pesan tersimpan secara lokal (demo). Hubungkan form ini ke layanan email/API Anda sendiri agar benar-benar terkirim.';
      contactSubmitBtn.disabled = true;
      flashButtonText(contactSubmitBtn, 'Terkirim ✓', 2000);
      setTimeout(function () { contactSubmitBtn.disabled = false; }, 2000);
      contactForm.reset();
    });
  }


  /* ========================================================================
     10. FOOTER: TAHUN & TANGGAL KEBIJAKAN
  ======================================================================== */

  var currentYear = new Date().getFullYear();
  var footerYear = document.getElementById('footer-year');
  var footerYearSide = document.getElementById('footer-year-side');
  if (footerYear) footerYear.textContent = currentYear;
  if (footerYearSide) footerYearSide.textContent = currentYear;

});
