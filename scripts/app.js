/**
 * Digital Business Card - Main Application Script
 * Project: EOPeak Corporate Design
 * Author: Eng. Eslam Osama Saad
 * Description: Handles all interactive functionality for the digital business card
 */

/* ============================================================
   CONTACT INTERACTION HANDLER
   ============================================================ */

/**
 * Opens compose in the Gmail app on mobile (iOS / Android), Gmail web on desktop.
 * @param {string} email - Recipient email address
 */
function openGmailCompose(email) {
  const address = (email || '').trim();
  if (!address) return;

  const encoded = encodeURIComponent(address);
  const ua = navigator.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const webCompose =
    'https://mail.google.com/mail/?view=cm&fs=1&to=' + encoded;

  if (isIOS) {
    window.location.href = 'googlegmail:///co?to=' + encoded;
    return;
  }

  if (isAndroid) {
    window.location.href =
      'intent://send?to=' + encoded +
      '#Intent;scheme=mailto;package=com.google.android.gm;S.browser_fallback_url=' +
      encodeURIComponent(webCompose) +
      ';end';
    return;
  }

  window.open(webCompose, '_blank', 'noopener,noreferrer');
}

/**
 * Handles click events on contact items
 * @param {string} type - Type of contact action (whatsapp, email, website, location)
 * @param {Event} event - The click event object
 */
function handleContactClick(type, event) {
  const data = getCardData();

  switch(type) {
    case 'whatsapp':
      // Open WhatsApp chat with the specified number
      // Format: https://wa.me/[country_code][phone_number] (no + or -)
      window.open('https://wa.me/13055550123', '_blank');
      break;
    case 'email':
      openGmailCompose(data.email || 'Sjohn@gmail.com');
      break;
    case 'website':
      window.open('https://www.SjohnHome.com', '_blank');
      break;
    case 'location':
      window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Miami, FL'), '_blank', 'noopener,noreferrer');
      break;
    default:
      console.warn(`Unknown contact type: ${type}`);
  }
  
  // Create ripple effect on the clicked element
  createRipple(event);
}

/* ============================================================
   RIPPLE EFFECT FUNCTIONALITY
   ============================================================ */

/**
 * Creates a Material Design-style ripple effect on click
 * @param {Event} event - The click event object
 */
function createRipple(event) {
  const button = event.currentTarget;
  
  // Create ripple element
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  
  // Position the ripple at click coordinates
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
  circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
  circle.classList.add('ripple');
  
  // Remove existing ripple if present to prevent stacking
  const existingRipple = button.getElementsByClassName('ripple')[0];
  if (existingRipple) {
    existingRipple.remove();
  }
  
  // Append the new ripple effect
  button.appendChild(circle);
}

/* ============================================================
   QR CODE MODAL FUNCTIONALITY
   ============================================================ */

/**
 * QR Code Modal Manager
 * Handles opening, closing, and downloading QR code
 */
const QRModal = {
  modal: null,
  overlay: null,
  closeBtn: null,
  downloadBtn: null,
  qrImage: null,
  qrErrorMessage: null,
  isOpen: false,
  previouslyFocused: null,
  focusableSelector: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  
  /**
   * Initialize QR modal functionality
   */
  init() {
    // Get modal elements
    this.modal = document.getElementById('qr-modal');
    this.overlay = this.modal.querySelector('.qr-modal-overlay');
    this.closeBtn = this.modal.querySelector('.qr-modal-close');
    this.downloadBtn = document.getElementById('qr-download-btn');
    this.qrImage = document.getElementById('qr-code-image');
    this.qrErrorMessage = document.getElementById('qr-error-message');
    
    // Attach event listeners
    this.attachEvents();
  },

  getFocusableElements() {
    return Array.from(this.modal.querySelectorAll(this.focusableSelector))
      .filter((el) => !el.disabled && el.offsetParent !== null);
  },

  handleFocusTrap(e) {
    if (!this.isOpen || e.key !== 'Tab') return;

    const focusable = this.getFocusableElements();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  },
  
  /**
   * Attach all event listeners for modal
   */
  attachEvents() {
    // Close button click
    this.closeBtn.addEventListener('click', () => this.close());
    
    // Overlay click to close
    this.overlay.addEventListener('click', () => this.close());
    
    // Download button click
    this.downloadBtn.addEventListener('click', () => this.downloadQR());
    
    // ESC key to close (blur focus to prevent outline)
    this.modalKeydownHandler = (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close(true);
      }
      this.handleFocusTrap(e);
    };
    document.addEventListener('keydown', this.modalKeydownHandler);
    
    // Handle image load error
    this.qrImage.addEventListener('error', () => {
      this.qrImage.classList.add('error');
      if (this.qrErrorMessage) {
        this.qrErrorMessage.hidden = false;
      }
      console.error('Failed to load QR code image');
    });
    
    // Remove error class on successful load
    this.qrImage.addEventListener('load', () => {
      this.qrImage.classList.remove('error');
      if (this.qrErrorMessage) {
        this.qrErrorMessage.hidden = true;
      }
    });
  },
  
  /**
   * Open the QR code modal
   */
  open() {
    if (this.isOpen) return; // Prevent multiple rapid opens
    if (typeof VideoHandler !== 'undefined' && VideoHandler.isOpen) {
      VideoHandler.close();
    }

    this.previouslyFocused = document.activeElement;
    
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    this.isOpen = true;
    
    // Focus close button for accessibility
    setTimeout(() => this.closeBtn.focus(), 100);
  },
  
  /**
   * Close the QR code modal
   * @param {boolean} blurFocus - If true, blur focus instead of returning it
   */
  close(blurFocus = false) {
    if (!this.isOpen) return; // Prevent multiple rapid closes
    
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    this.isOpen = false;
    
    // Return focus to QR button (only for mouse interactions)
    // For keyboard (ESC), blur focus to prevent unwanted outline
    const returnTarget = this.previouslyFocused || document.getElementById('qr-code-btn');
    if (returnTarget) {
      if (blurFocus) {
        returnTarget.blur();
      } else {
        returnTarget.focus();
      }
    }
    this.previouslyFocused = null;
  },
  
  /**
   * Download QR code image
   */
  downloadQR() {
    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = this.qrImage.src;
      link.download = 'QR-Code-Digital-Business-Card.png';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Optional: Show feedback (could add a toast notification here)
      console.log('QR Code download initiated');
    } catch (error) {
      console.error('Failed to download QR code:', error);
      alert('Unable to download QR code. Please try right-clicking the image and selecting "Save Image As..."');
    }
  }
};

/* ============================================================
   COPY TO CLIPBOARD FUNCTIONALITY
   ============================================================ */

/**
 * Handles copy to clipboard for WhatsApp and Email
 * @param {HTMLElement} button - The copy button element
 */
function handleCopyClick(button) {
  const textToCopy = button.getAttribute('data-copy-text');
  
  // Use modern Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showCopySuccess(button);
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
        // Fallback for copy failure
        fallbackCopy(textToCopy, button);
      });
  } else {
    // Fallback for older browsers
    fallbackCopy(textToCopy, button);
  }
}

/**
 * Shows success feedback when text is copied
 * @param {HTMLElement} button - The copy button element
 */
function showCopySuccess(button) {
  // Add copied class for icon transition
  button.classList.add('copied');
  
  // Change ARIA label for screen readers
  const originalLabel = button.getAttribute('aria-label');
  button.setAttribute('aria-label', 'Copied!');

  const liveRegion = document.getElementById('copy-status');
  if (liveRegion) {
    liveRegion.textContent = 'Copied to clipboard';
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 2000);
  }
  
  // Reset after 2 seconds
  setTimeout(() => {
    button.classList.remove('copied');
    button.setAttribute('aria-label', originalLabel);
  }, 2000);
}

/**
 * Fallback copy method for older browsers
 * @param {string} text - Text to copy
 * @param {HTMLElement} button - The copy button element
 */
function fallbackCopy(text, button) {
  // Create temporary textarea
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  
  // Select and copy
  textarea.select();
  try {
    document.execCommand('copy');
    showCopySuccess(button);
  } catch (err) {
    console.error('Fallback copy failed:', err);
    alert(`Please copy manually: ${text}`);
  }
  
  // Clean up
  document.body.removeChild(textarea);
}

/* ============================================================
   VCARD & SHARE
   ============================================================ */

let cardConfig = null;
let labelsConfig = null;

/**
 * Loads owner config from data/card.json when available
 */
async function loadCardConfig() {
  try {
    const response = await fetch('data/card.json', { cache: 'no-cache' });
    if (response.ok) {
      cardConfig = await response.json();
    }
  } catch (err) {
    console.warn('card.json not loaded, using defaults:', err);
  }
}

/**
 * Loads i18n labels from data/labels.json
 */
async function loadLabels() {
  try {
    const response = await fetch('data/labels.json', { cache: 'no-cache' });
    if (response.ok) {
      labelsConfig = await response.json();
    }
  } catch (err) {
    console.warn('labels.json not loaded, using defaults:', err);
  }
}

function getActiveLang() {
  const data = getCardData();
  return data.lang || document.documentElement.lang || 'en';
}

function getShowcaseLabels() {
  const lang = getActiveLang();
  const fromFile = labelsConfig && labelsConfig[lang] && labelsConfig[lang].showcase;
  const enFallback = labelsConfig && labelsConfig.en && labelsConfig.en.showcase;

  return fromFile || enFallback || {
    triggerAria: "Play personal introduction",
    triggerHint: 'Introduction',
    eyebrow: 'From My Desk',
    title: 'The Miami Difference',
    caption: 'How I guide clients from first viewing to closing day in South Florida.',
    modalAria: 'Introduction video',
    closeAria: 'Close introduction video',
    unavailable: 'This message is being updated. Please check back shortly.'
  };
}

function isShowcaseEnabled() {
  const video = getCardData().showcaseVideo;
  return Boolean(video && video.enabled !== false);
}

function versionedAssetUrl(path) {
  const versions = window.ASSET_VERSIONS || { IMAGE_VERSION: '1.0.0' };
  const separator = path.indexOf('?') >= 0 ? '&' : '?';
  return path + separator + 'v=' + encodeURIComponent(versions.IMAGE_VERSION);
}

function applyDocumentLanguage() {
  const lang = getActiveLang();
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

function applyProfileFromConfig() {
  const data = getCardData();
  const photo = document.getElementById('profile-photo');
  if (photo && data.profileImage) {
    photo.src = data.profileImage;
    photo.alt = (data.fullName || 'Owner') + ', ' + (data.title || '') + ' — professional portrait';
  }
}

function applyVideoEmbedFromConfig() {
  const frame = document.getElementById('profileVideoFrame');
  const showcase = getCardData().showcaseVideo;
  if (frame && showcase && showcase.embedUrl) {
    frame.setAttribute('data-src', showcase.embedUrl);
  }
}

/**
 * Sets canonical / Open Graph URLs for production (Vercel, custom domain).
 * Uses card.json shareUrl when set; otherwise current origin.
 */
function applyProductionMeta() {
  const data = getCardData();
  let pageUrl = data.shareUrl && data.shareUrl.trim();

  if (!pageUrl) {
    const path = window.location.pathname.replace(/index\.html$/i, '');
    const normalized = path.endsWith('/') ? path : path + '/';
    pageUrl = window.location.origin + (normalized === '/' ? '/' : normalized);
  }

  if (!pageUrl.endsWith('/')) {
    pageUrl += '/';
  }

  const canonical = document.getElementById('canonical-link');
  if (canonical) canonical.href = pageUrl;

  const ogUrl = document.getElementById('og-url');
  if (ogUrl) ogUrl.setAttribute('content', pageUrl);
}

function getCardData() {
  if (cardConfig) return cardConfig;

  return {
    lang: 'en',
    fullName: 'Sarah Johnson',
    title: 'Real Estate Agent',
    email: 'Sjohn@gmail.com',
    phone: '+13055550123',
    website: 'https://www.SjohnHome.com',
    location: 'Miami, FL',
    organization: 'Sarah Johnson Homes',
    profileImage: 'https://cdn.pixabay.com/photo/2018/01/15/07/51/woman-3083386_960_720.jpg',
    showcaseVideo: {
      enabled: true,
      type: 'embed',
      embedUrl: 'https://www.youtube.com/embed/2Ri8f-wqonE?playsinline=1&rel=0&modestbranding=1',
      fileSrc: '',
      poster: ''
    }
  };
}

function buildVCard(data) {
  const nameParts = (data.fullName || '').trim().split(/\s+/);
  const familyName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0] || '';
  const givenNames = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '';

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'FN:' + data.fullName,
    'N:' + familyName + ';' + givenNames + ';;;',
    'TITLE:' + data.title,
    'TEL;TYPE=CELL:' + data.phone,
    'EMAIL;TYPE=INTERNET:' + data.email,
    'URL:' + data.website,
    'ADR;TYPE=WORK:;;' + data.location + ';;;;',
    'ORG:' + (data.organization || data.fullName)
  ];
  return lines.join('\r\n') + '\r\nEND:VCARD\r\n';
}

function downloadVCard() {
  const data = getCardData();
  const vcard = buildVCard(data);
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = data.fullName.replace(/\s+/g, '-') + '.vcf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  const liveRegion = document.getElementById('copy-status');
  if (liveRegion) {
    liveRegion.textContent = 'Contact file downloaded';
    setTimeout(() => { liveRegion.textContent = ''; }, 2000);
  }
}

async function shareCard() {
  const data = getCardData();
  const shareUrl = data.shareUrl || window.location.href;
  const shareData = {
    title: data.fullName + ' - ' + data.title,
    text: data.slogan || 'Digital business card',
    url: shareUrl
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(shareUrl).then(() => {
      const liveRegion = document.getElementById('copy-status');
      if (liveRegion) {
        liveRegion.textContent = 'Link copied to clipboard';
        setTimeout(() => { liveRegion.textContent = ''; }, 2000);
      }
    }).catch(() => {
      alert('Share this link: ' + shareUrl);
    });
  } else {
    alert('Share this link: ' + shareUrl);
  }
}

/* ============================================================
   PWA INSTALL BANNER
   ============================================================ */

const PWAInstall = {
  deferredPrompt: null,
  banner: null,
  installBtn: null,
  dismissBtn: null,
  installedKey: 'dbc-pwa-installed-v2',
  dismissedThisView: false,
  fallbackTimer: null,

  init() {
    this.banner = document.getElementById('pwa-install-banner');
    this.installBtn = document.getElementById('pwa-install-btn');
    this.dismissBtn = document.getElementById('pwa-install-dismiss');

    if (!this.banner) return;

    this.hide();

    if (this.isStandalone()) {
      localStorage.setItem(this.installedKey, '1');
      return;
    }

    if (localStorage.getItem(this.installedKey)) {
      this.hide();
    }

    // Some browsers (notably iOS Safari) never fire beforeinstallprompt.
    // Show the compact helper if the card is not installed and the user has not dismissed this page view.
    this.fallbackTimer = window.setTimeout(() => {
      if (!this.deferredPrompt && !this.dismissedThisView && !this.isKnownInstalled()) {
        this.show();
      }
    }, 1200);

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      if (this.fallbackTimer) {
        window.clearTimeout(this.fallbackTimer);
        this.fallbackTimer = null;
      }

      // If the browser fires this event, the app is installable from this context.
      localStorage.removeItem(this.installedKey);

      if (!this.dismissedThisView) {
        this.show();
      }
    });

    window.addEventListener('appinstalled', () => {
      localStorage.setItem(this.installedKey, '1');
      this.deferredPrompt = null;
      this.hide();
    });

    if (this.installBtn) {
      this.installBtn.addEventListener('click', () => this.promptInstall());
    }

    if (this.dismissBtn) {
      this.dismissBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.dismissedThisView = true;
        this.hide();
      });
    }
  },

  isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      window.navigator.standalone === true;
  },

  isKnownInstalled() {
    return this.isStandalone() || localStorage.getItem(this.installedKey);
  },

  show() {
    if (!this.banner || this.dismissedThisView || this.isKnownInstalled()) return;
    this.banner.hidden = false;
    this.banner.setAttribute('aria-hidden', 'false');
  },

  hide() {
    if (!this.banner) return;
    this.banner.hidden = true;
    this.banner.setAttribute('aria-hidden', 'true');
  },

  async promptInstall() {
    if (!this.deferredPrompt) {
      this.dismissedThisView = true;
      this.hide();
      this.showManualInstallHelp();
      return;
    }

    this.deferredPrompt.prompt();
    const choice = await this.deferredPrompt.userChoice;

    // Only appinstalled / standalone mode marks the card as installed.
    // A cancelled prompt should reappear after a page reload if still not installed.
    if (!choice || choice.outcome !== 'accepted') {
      this.dismissedThisView = true;
    }

    this.deferredPrompt = null;
    this.hide();
  },

  showManualInstallHelp() {
    const ua = navigator.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const message = isIOS
      ? 'To add this card: tap Share, then Add to Home Screen.'
      : 'Use your browser menu and choose Install app or Add to Home screen.';

    window.alert(message);
  }
};

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}

/* ============================================================
   FOCUS MANAGEMENT - Prevent Unwanted Outlines
   ============================================================ */

/**
 * Intelligent focus management to prevent unwanted focus frames
 * Only shows focus outline for actual keyboard Tab navigation
 */
let isUsingKeyboard = false;

// Track when user starts using keyboard
document.addEventListener('keydown', function(e) {
  if (e.key === 'Tab') {
    isUsingKeyboard = true;
    document.body.classList.add('keyboard-navigation');
  }
});

// Track when user starts using mouse
document.addEventListener('mousedown', function() {
  isUsingKeyboard = false;
  document.body.classList.remove('keyboard-navigation');
});

/* ============================================================
   DOM CONTENT LOADED - INITIALIZATION
   ============================================================ */

/**
 * Initialize all event listeners when DOM is fully loaded
 * This ensures all elements are available before attaching events
 * 
 * NOTE: Handles both cases:
 * - DOMContentLoaded hasn't fired yet: Wait for event
 * - DOMContentLoaded already fired: Initialize immediately (for cache-busting dynamic injection)
 */
async function initializeApp() {
  await loadCardConfig();
  await loadLabels();
  applyDocumentLanguage();
  applyProfileFromConfig();
  applyVideoEmbedFromConfig();
  applyProductionMeta();
  registerServiceWorker();
  PWAInstall.init();

  // ========== Apply Cache-Busting to Image Assets ==========
  // Apply versioning to all image assets that need cache-busting
  var versions = window.ASSET_VERSIONS || { IMAGE_VERSION: '1.0.0' };
  
  // QR Code image versioning
  var qrImage = document.getElementById('qr-code-image');
  if (qrImage && !qrImage.src) {
    // Only set if src not already set (prevents override if set in script.onload)
    qrImage.src = 'assets/MYQR.png?v=' + encodeURIComponent(versions.IMAGE_VERSION);
  }
  
  // ========== Contact Grid Items Event Listeners ==========
  const contactItems = document.querySelectorAll('.contact-item');
  
  contactItems.forEach((item) => {
    // Get the contact type from data attribute
    const contactType = item.getAttribute('data-contact-type');
    
    // Attach click event listener
    item.addEventListener('click', function(event) {
      handleContactClick(contactType, event);
    });

    item.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleContactClick(contactType, event);
      }
    });
  });
  
  // ========== Social Icons Ripple Effect ==========
  const socialIcons = document.querySelectorAll('.social-icon');
  
  socialIcons.forEach((icon) => {
    // Add ripple effect to social icons on click
    icon.addEventListener('click', createRipple);
  });
  
  // ========== QR Code Button ==========
  const qrCodeBtn = document.getElementById('qr-code-btn');
  
  if (qrCodeBtn) {
    // Open QR modal on click
    qrCodeBtn.addEventListener('click', function(event) {
      createRipple(event);
      QRModal.open();
    });
  }
  
  // ========== Initialize QR Modal ==========
  QRModal.init();

  // ========== Showcase Video (YouTube embed via VideoHandler) ==========
  if (typeof VideoHandler !== 'undefined') {
    VideoHandler.init({
      profileVideo: document.getElementById('profileVideoFrame'),
      profileVideoSource: null,
      getLabels: getShowcaseLabels,
      isEnabled: isShowcaseEnabled,
      onRipple: createRipple
    });
  }
  
  // ========== Copy Buttons ==========
  const copyButtons = document.querySelectorAll('.copy-btn');
  
  copyButtons.forEach((button) => {
    // Handle copy button click
    button.addEventListener('click', function(event) {
      event.stopPropagation(); // Prevent triggering parent contact-item click
      handleCopyClick(button);
    });
  });

  // Call links — do not trigger WhatsApp tile click
  document.querySelectorAll('.call-btn').forEach((link) => {
    link.addEventListener('click', function(event) {
      event.stopPropagation();
    });
  });

  const saveContactBtn = document.getElementById('save-contact-btn');
  if (saveContactBtn) {
    saveContactBtn.addEventListener('click', downloadVCard);
  }

  const shareCardBtn = document.getElementById('share-card-btn');
  if (shareCardBtn) {
    shareCardBtn.addEventListener('click', shareCard);
  }
  
}

// Check if DOM is already loaded (handles dynamic script injection for cache-busting)
// If DOMContentLoaded already fired, initialize immediately
// Otherwise, wait for DOMContentLoaded event
if (document.readyState === 'loading') {
  // DOM still loading, wait for DOMContentLoaded
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM already loaded (DOMContentLoaded already fired)
  // Initialize immediately (for cache-busting dynamic script injection)
  initializeApp();
}

