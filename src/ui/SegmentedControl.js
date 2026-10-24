/**
 * SegmentedControl - Apple HIG Sliding Pill Segmented Switcher.
 */
export class SegmentedControl {
  constructor({ container, options = [], defaultId, onChange, audioHaptics } = {}) {
    this.container = container;
    this.options = options;
    this.selectedId = defaultId || (options[0] ? options[0].id : null);
    this.onChange = onChange;
    this.audio = audioHaptics;
    this.pillEl = null;

    if (this.container) {
      this.render();
    }
  }

  render() {
    this.container.classList.add('ios-segmented-control');
    this.container.innerHTML = `
      <div class="segmented-pill-thumb"></div>
      ${this.options
        .map(
          (opt) => `
        <button type="button" class="segmented-option ${opt.id === this.selectedId ? 'active' : ''}" data-id="${opt.id}">
          ${opt.label}
        </button>
      `
        )
        .join('')}
    `;

    this.pillEl = this.container.querySelector('.segmented-pill-thumb');
    this._bindEvents();
    this.updateThumbPosition();
  }

  _bindEvents() {
    const buttons = this.container.querySelectorAll('.segmented-option');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.select(id);
      });
    });

    window.addEventListener('resize', () => this.updateThumbPosition());
  }

  select(id) {
    if (this.selectedId === id) return;
    this.selectedId = id;

    if (this.audio) this.audio.tick();

    const buttons = this.container.querySelectorAll('.segmented-option');
    buttons.forEach((btn) => {
      if (btn.getAttribute('data-id') === id) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.updateThumbPosition();

    if (typeof this.onChange === 'function') {
      this.onChange(id);
    }
  }

  updateThumbPosition() {
    if (!this.pillEl || !this.container) return;
    const activeBtn = this.container.querySelector(`.segmented-option[data-id="${this.selectedId}"]`);
    if (!activeBtn) return;

    const offsetLeft = activeBtn.offsetLeft;
    const width = activeBtn.offsetWidth;

    this.pillEl.style.transform = `translateX(${offsetLeft}px)`;
    this.pillEl.style.width = `${width}px`;
  }
}
