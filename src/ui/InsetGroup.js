/**
 * InsetGroup - Apple Settings-style Rounded Inset Grouped Table View Builder.
 */
export class InsetGroup {
  static create({ header = '', footer = '', rows = [] } = {}) {
    return `
      <div class="ios-group-container">
        ${header ? `<div class="ios-group-header">${header}</div>` : ''}
        <div class="ios-inset-card">
          ${rows.map((row, idx) => this.renderRow(row, idx === rows.length - 1)).join('')}
        </div>
        ${footer ? `<div class="ios-group-footer">${footer}</div>` : ''}
      </div>
    `;
  }

  static renderRow(row, isLast) {
    const {
      id = '',
      icon = '',
      title = '',
      subtitle = '',
      detail = '',
      badge = '',
      type = 'nav', // 'nav' | 'switch' | 'button' | 'value'
      checked = false,
      destructive = false,
    } = row;

    return `
      <div class="ios-table-row ${isLast ? 'last-row' : ''} ${destructive ? 'destructive-row' : ''}" data-row-id="${id}">
        <div class="row-leading">
          ${icon ? `<span class="row-icon">${icon}</span>` : ''}
          <div class="row-label-group">
            <span class="row-title ${destructive ? 'text-destructive' : ''}">${title}</span>
            ${subtitle ? `<span class="row-subtitle">${subtitle}</span>` : ''}
          </div>
        </div>

        <div class="row-trailing">
          ${badge ? `<span class="ios-badge">${badge}</span>` : ''}
          ${detail ? `<span class="row-detail">${detail}</span>` : ''}
          ${
            type === 'switch'
              ? `
            <label class="ios-switch">
              <input type="checkbox" id="switch-${id}" ${checked ? 'checked' : ''} />
              <span class="ios-switch-slider"></span>
            </label>
          `
              : ''
          }
          ${type === 'nav' ? `<span class="row-chevron">›</span>` : ''}
        </div>
      </div>
    `;
  }
}
