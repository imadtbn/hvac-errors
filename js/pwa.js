/* ============================================
   PWA Install System
   - زر التثبيت في أعلى الموقع (Header)
   - إشعار تثبيت عند أول زيارة
   - تسجيل Service Worker (مع دعم GitHub Pages subpath)
   ============================================ */

(function () {
  'use strict';

  const INSTALL_SEEN_KEY = 'hvac-install-shown';
  const INSTALL_DONE_KEY = 'hvac-installed';

  // ============================================
  // 1. REGISTER SERVICE WORKER
  // ============================================
  const scriptBase = document.currentScript ? new URL('../', document.currentScript.src) : new URL('./', document.baseURI);
  const pageScope = new URL('./', document.baseURI).pathname;

  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register(new URL('service-worker.js', scriptBase), {
      scope: pageScope
    }).then((reg) => {
      console.log('SW registered:', reg.scope);
      // تحديث فوري عند إصدار جديد من الخدمة
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showReloadBanner();
            }
          });
        }
      });
    }).catch((err) => console.warn('SW registration failed:', err));
  }

  function showReloadBanner() {
    // شريط صغير في الأعلى يُعلم المستخدم بوجود تحديث
    const existing = document.getElementById('hvacUpdateBanner');
    if (existing) return;
    const banner = document.createElement('div');
    banner.id = 'hvacUpdateBanner';
    banner.className = 'pwa-update-banner';
    const en = document.documentElement.lang === 'en';
    banner.innerHTML = `<span>🔄 ${en ? 'A new version is available. Reload to get the latest updates.' : 'توجد نسخة محدثة من الموقع. أعد تحميل الصفحة للحصول على أحدث الأعطال.'}</span><button id="hvacUpdateBtn" class="btn-update">${en ? 'Reload' : 'إعادة تحميل'}</button><button class="btn-update-close" id="hvacUpdateClose" title="${en ? 'Close' : 'إغلاق'}">✕</button>`;
    document.body.appendChild(banner);
    document.getElementById('hvacUpdateBtn').addEventListener('click', () => location.reload());
    document.getElementById('hvacUpdateClose').addEventListener('click', () => banner.remove());
  }

  // ============================================
  // 2. INSTALL PROMPT (beforeinstallprompt)
  // ============================================
  let deferredPrompt = null;
  let isAppInstalled = false;

  function detectAppInstalled() {
    // تشغيل داخل التطبيق المثبت فعلاً (standalone) أو على iOS
    if (window.matchMedia('(display-mode: standalone)').matches) return true;
    if (navigator.standalone) return true; // iOS
    return false;
  }

  function isInstallSupported() {
    // iOS لا يدعم beforeinstallprompt؛ نعرض زر التثبيت يدوياً
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    return isIOS || !!deferredPrompt;
  }

  function setupInstallButton() {
    // زر التثبيت في أعلى الموقع (Header)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      updateInstallUI();
    });

    // مراقبة التثبيت
    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      isAppInstalled = true;
      localStorage.setItem(INSTALL_DONE_KEY, '1');
      updateInstallUI();
    });

    // زر التثبيت في الهيدر
    const installBtn = document.getElementById('hvacInstallBtn');
    if (installBtn) {
      installBtn.addEventListener('click', handleInstallClick);
    }
    updateInstallUI();
  }

  function updateInstallUI() {
    const installBtn = document.getElementById('hvacInstallBtn');
    if (!installBtn) return;

    isAppInstalled = detectAppInstalled() || localStorage.getItem(INSTALL_DONE_KEY) === '1';

    if (isAppInstalled) {
      installBtn.style.display = 'none';
      return;
    }

    const supported = isInstallSupported();
    installBtn.style.display = supported ? 'inline-flex' : 'none';
    installBtn.title = supported ? 'تثبيت الموقع على جهازك' : 'تثبيت التطبيق';
  }

  async function handleInstallClick() {
    if (!isAppInstalled && deferredPrompt) {
      // العرض الأول للإشعار الأصلي (قبل الضغط على الزر)
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem(INSTALL_DONE_KEY, '1');
      }
      deferredPrompt = null;
      updateInstallUI();
    } else if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
      // iOS: تعليمات الإضافة للشاشة الرئيسية
      showIOSInstallBanner();
    }
  }

  // ============================================
  // 3. FIRST-VISIT INSTALL NOTIFICATION (Banner)
  // ============================================
  function showInstallBanner() {
    if (localStorage.getItem(INSTALL_SEEN_KEY)) return;
    if (isAppInstalled || !isInstallSupported()) return;

    const banner = document.createElement('div');
    banner.id = 'hvacInstallBanner';
    banner.className = 'pwa-install-banner';
    const en = document.documentElement.lang === 'en';
    banner.innerHTML = `
      <div class="pwa-banner-content">
        <div class="pwa-banner-icon">❄️</div>
        <div class="pwa-banner-text">
          <strong>${en ? 'Install the HVAC guide on your device' : 'ثبّت دليل أعطال التكييف على جهازك!'}</strong>
          <span>${en ? 'Use it like an app, with offline support.' : 'استخدم الموقع كتطبيق بدون متصفح، مع دعم العمل بدون إنترنت.'}</span>
        </div>
        <div class="pwa-banner-actions">
          <button class="btn btn-primary" id="pwaInstallBtn">📲 ${en ? 'Install now' : 'تثبيت الآن'}</button>
          <button class="pwa-banner-dismiss" id="pwaDismissBtn" title="${en ? 'Close' : 'إغلاق'}">✕</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    document.getElementById('pwaInstallBtn').addEventListener('click', () => {
      banner.classList.add('dismissed');
      localStorage.setItem(INSTALL_SEEN_KEY, '1');
      handleInstallClick();
    });
    document.getElementById('pwaDismissBtn').addEventListener('click', () => {
      banner.classList.add('dismissed');
      localStorage.setItem(INSTALL_SEEN_KEY, '1');
    });
    // إغلاق تلقائي بعد 15 ثانية
    setTimeout(() => {
      if (banner.parentNode) banner.classList.add('dismissed');
      localStorage.setItem(INSTALL_SEEN_KEY, '1');
    }, 15000);
  }

  function showIOSInstallBanner() {
    if (localStorage.getItem(INSTALL_SEEN_KEY)) return;
    const banner = document.createElement('div');
    banner.id = 'hvacInstallBanner';
    banner.className = 'pwa-install-banner';
    const en = document.documentElement.lang === 'en';
    banner.innerHTML = `
      <div class="pwa-banner-content">
        <div class="pwa-banner-icon">📱</div>
        <div class="pwa-banner-text">
          <strong>${en ? 'Add the HVAC guide to your home screen' : 'أضف دليل الأعطال إلى شاشتك الرئيسية'}</strong>
          <span>${en ? 'Tap the share icon ⬆️, then choose “Add to Home Screen”.' : 'من أيقونة المشاركة ⬆️ في الأسفل ثم اختر «إضافة إلى الشاشة الرئيسية».'}</span>
        </div>
        <div class="pwa-banner-actions">
          <button class="pwa-banner-dismiss" id="pwaDismissBtn" title="${en ? 'Close' : 'إغلاق'}">✕</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);
    document.getElementById('pwaDismissBtn').addEventListener('click', () => {
      banner.classList.add('dismissed');
      localStorage.setItem(INSTALL_SEEN_KEY, '1');
    });
  }

  // ============================================
  // INIT
  // ============================================
  if (window.location.protocol.startsWith('http')) {
    registerSW();
    setupInstallButton();
    // عرض إشعار أول زيارة بعد فترة قصيرة (لعدم مقاطعة التصفح)
    document.addEventListener('dataLoaded', () => {
      setTimeout(showInstallBanner, 2500);
    });
    // احتياط: إذا لم يحدث dataLoaded (صفحات بلا بيانات)
    window.addEventListener('load', () => {
      setTimeout(showInstallBanner, 5000);
    });
  }
})();
