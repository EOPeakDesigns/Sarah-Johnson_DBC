/**
 * VideoHandler — profile showcase modal (YouTube embed + legacy <video> support)
 * Project: EOPeak Corporate Design
 */

const VideoHandler = {
  modal: null,
  overlay: null,
  closeBtn: null,
  iframe: null,
  video: null,
  videoSource: null,
  trigger: null,
  mediaWrap: null,
  eyebrowEl: null,
  titleEl: null,
  captionEl: null,
  chipsEl: null,
  isOpen: false,
  previouslyFocused: null,
  focusableSelector: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  getLabels: null,
  isEnabled: null,
  onRipple: null,

  init(options) {
    options = options || {};

    this.modal =
      document.getElementById('video-modal') ||
      document.getElementById('videoModal');
    if (!this.modal) return;

    this.overlay = this.modal.querySelector('.video-modal-overlay, .qr-modal-overlay');
    this.closeBtn = document.getElementById('video-modal-close');
    this.iframe = options.profileVideo || document.getElementById('profileVideoFrame');
    this.video = this.modal.querySelector('video');
    this.videoSource = options.profileVideoSource || document.getElementById('profileVideoSource');
    this.trigger = document.getElementById('showcase-video-trigger');
    this.mediaWrap = document.getElementById('profile-media');
    this.eyebrowEl = document.getElementById('video-modal-eyebrow');
    this.titleEl = document.getElementById('video-modal-title');
    this.captionEl = document.getElementById('video-modal-caption');
    this.chipsEl = document.getElementById('video-specialty-chips');

    this.getLabels = typeof options.getLabels === 'function' ? options.getLabels : function () { return {}; };
    this.isEnabled = typeof options.isEnabled === 'function' ? options.isEnabled : function () { return true; };
    this.onRipple = typeof options.onRipple === 'function' ? options.onRipple : null;

    this.setLabels();
    this.attachEvents();
    this.setupTrigger();
  },

  setLabels() {
    const labels = this.getLabels() || {};

    if (this.eyebrowEl && labels.eyebrow) this.eyebrowEl.textContent = labels.eyebrow;
    if (this.titleEl && labels.title) this.titleEl.textContent = labels.title;
    if (this.captionEl && labels.caption) this.captionEl.textContent = labels.caption;
    if (this.modal && labels.modalAria) {
      this.modal.setAttribute('aria-label', labels.modalAria);
    }
    if (this.closeBtn && labels.closeAria) {
      this.closeBtn.setAttribute('aria-label', labels.closeAria);
    }
    if (this.iframe && labels.title) {
      this.iframe.setAttribute('title', labels.title);
    }

    if (this.chipsEl) {
      const specialties = labels.specialties;
      if (specialties && specialties.length) {
        this.chipsEl.hidden = false;
        this.chipsEl.innerHTML = specialties
          .map(function (text) {
            return '<span class="video-chip">' + VideoHandler.escapeHtml(text) + '</span>';
          })
          .join('');
      } else {
        this.chipsEl.hidden = true;
        this.chipsEl.innerHTML = '';
      }
    }
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  setupTrigger() {
    if (!this.trigger || !this.mediaWrap) return;

    if (!this.isEnabled()) {
      this.mediaWrap.classList.add('profile-media--static');
      this.trigger.setAttribute('aria-hidden', 'true');
      this.trigger.tabIndex = -1;
      return;
    }

    const labels = this.getLabels();
    if (labels.triggerAria) {
      this.trigger.setAttribute('aria-label', labels.triggerAria);
    }

    this.trigger.addEventListener('click', (event) => {
      if (this.onRipple) this.onRipple(event);
      this.open();
    });
  },

  getFocusableElements() {
    return Array.from(this.modal.querySelectorAll(this.focusableSelector))
      .filter(function (el) { return !el.disabled && el.offsetParent !== null; });
  },

  handleFocusTrap(e) {
    if (!this.isOpen || e.key !== 'Tab') return;

    const focusable = this.getFocusableElements();
    if (!focusable.length) return;

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

  attachEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }

    this.modalKeydownHandler = (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close(true);
      }
      this.handleFocusTrap(e);
    };
    document.addEventListener('keydown', this.modalKeydownHandler);
  },

  loadEmbed() {
    if (!this.iframe) return;
    const src = this.iframe.getAttribute('data-src');
    if (src) {
      this.iframe.src = src;
    }
  },

  unloadEmbed() {
    if (!this.iframe) return;
    this.iframe.removeAttribute('src');
    this.iframe.src = '';
  },

  loadLegacyVideo() {
    if (!this.video) return;
    if (this.videoSource && this.videoSource.src) {
      this.video.src = this.videoSource.src;
    }
    this.video.load();
  },

  pauseLegacyVideo() {
    if (!this.video) return;
    this.video.pause();
    try {
      this.video.currentTime = 0;
    } catch (err) {
      /* ignore */
    }
    this.video.removeAttribute('src');
    this.video.load();
  },

  open() {
    if (this.isOpen) return;

    if (typeof QRModal !== 'undefined' && QRModal.isOpen) {
      QRModal.close();
    }

    this.previouslyFocused = document.activeElement;
    this.setLabels();

    if (this.iframe) {
      this.loadEmbed();
    }
    if (this.video) {
      this.loadLegacyVideo();
    }

    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    this.isOpen = true;

    var self = this;
    setTimeout(function () {
      if (self.closeBtn) self.closeBtn.focus();
    }, 100);
  },

  close(blurFocus) {
    if (!this.isOpen) return;

    this.unloadEmbed();
    this.pauseLegacyVideo();

    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    this.isOpen = false;

    const returnTarget = this.previouslyFocused || this.trigger;
    if (returnTarget) {
      if (blurFocus) {
        returnTarget.blur();
      } else {
        returnTarget.focus();
      }
    }
    this.previouslyFocused = null;
  }
};

if (typeof window !== 'undefined') {
  window.VideoHandler = VideoHandler;
}
