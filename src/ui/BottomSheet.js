/**
 * BottomSheet - Gesture-Driven iOS Spring Action Sheet.
 * Supports swipe-down to dismiss, grabber zone tracking, and backdrop blur.
 */
export class BottomSheet {
  constructor({ container, audioHaptics } = {}) {
    this.container = container;
    this.audio = audioHaptics;
    this.isOpen = false;
    this.sheetEl = null;
    this.backdropEl = null;
    this.startY = 0;
    this.currentY = 0;
    this.isDragging = false;
    this.onCloseCallback = null;
  }

  show({ title, subtitle = '', contentHtml = '', onRender, onClose } = {}) {
    this.isOpen = true;
    this.onCloseCallback = onClose;

    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'modal-layer';
      document.body.appendChild(this.container);
    }

    this.container.classList.remove('hidden');

    this.container.innerHTML = `
      <div class="modal-backdrop" id="sheet-backdrop">
        <div class="ios-sheet animate-sheet-up" id="sheet-card">
          <div class="sheet-grabber-zone" id="sheet-grabber-zone" aria-label="Drag down to close">
            <div class="sheet-grabber"></div>
          </div>
          <div class="sheet-header">
            <div class="sheet-title-group">
              <h3 class="sheet-title">${title}</h3>
              ${subtitle ? `<p class="sheet-subtitle">${subtitle}</p>` : ''}
            </div>
            <button type="button" class="sheet-close-btn" id="sheet-btn-close" aria-label="Close">✕</button>
          </div>
          <div class="sheet-scrollable-body" id="sheet-body">
            ${contentHtml}
          </div>
        </div>
      </div>
    `;

    this.backdropEl = this.container.querySelector('#sheet-backdrop');
    this.sheetEl = this.container.querySelector('#sheet-card');

    if (this.audio) this.audio.tap();

    // Hook listeners
    this.container.querySelector('#sheet-btn-close').addEventListener('click', () => this.close());
    this.backdropEl.addEventListener('click', (e) => {
      if (e.target === this.backdropEl) this.close();
    });

    this._bindGestures();

    if (typeof onRender === 'function') {
      onRender(this.sheetEl, this);
    }
  }

  _bindGestures() {
    const grabberZone = this.container.querySelector('#sheet-grabber-zone');
    if (!grabberZone || !this.sheetEl) return;

    const onPointerDown = (e) => {
      this.isDragging = true;
      this.startY = e.clientY;
      this.currentY = e.clientY;
      this.sheetEl.style.transition = 'none';
      if (grabberZone.setPointerCapture) grabberZone.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;
      this.currentY = e.clientY;
      const deltaY = Math.max(0, this.currentY - this.startY);
      this.sheetEl.style.transform = `translateY(${deltaY}px)`;
    };

    const onPointerUp = (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.sheetEl.style.transition = 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1)';

      const deltaY = this.currentY - this.startY;
      if (deltaY > 85) {
        this.close();
      } else {
        this.sheetEl.style.transform = 'translateY(0)';
      }
    };

    grabberZone.addEventListener('pointerdown', onPointerDown);
    grabberZone.addEventListener('pointermove', onPointerMove);
    grabberZone.addEventListener('pointerup', onPointerUp);
    grabberZone.addEventListener('pointercancel', onPointerUp);
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;

    if (this.audio) this.audio.tap();

    if (this.sheetEl) this.sheetEl.classList.add('ios-sheet-closing');
    if (this.backdropEl) this.backdropEl.classList.add('backdrop-closing');

    setTimeout(() => {
      if (this.container) {
        this.container.classList.add('hidden');
        this.container.innerHTML = '';
      }
      if (typeof this.onCloseCallback === 'function') {
        this.onCloseCallback();
      }
    }, 220);
  }
}
