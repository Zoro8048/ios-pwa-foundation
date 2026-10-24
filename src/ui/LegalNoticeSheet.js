/**
 * LegalNoticeSheet - Standardized Non-Commercial & H-1B Compliance Modal.
 */
export class LegalNoticeSheet {
  constructor({ bottomSheet, appName = 'iOS PWA Foundation' } = {}) {
    this.sheet = bottomSheet;
    this.appName = appName;
  }

  show() {
    this.sheet.show({
      title: 'Legal & Non-Commercial Notice',
      subtitle: `${this.appName} • Personal Hobby Project`,
      contentHtml: `
        <div class="legal-notice-content">
          <div class="legal-badge-banner">
            <span class="legal-badge-icon">⚖️</span>
            <div>
              <strong>Strictly Non-Commercial Educational Prototype</strong>
              <p>Built exclusively as a private personal life utility.</p>
            </div>
          </div>

          <div class="legal-section">
            <h4>1. Zero Commercialization & Zero Revenue</h4>
            <p>This software is completely free, non-monetized, and contains zero subscriptions, paywalls, in-app purchases, advertisements, tipping mechanisms, affiliate links, or commercial sponsor relationships.</p>
          </div>

          <div class="legal-section">
            <h4>2. 100% Client-Side Local Privacy</h4>
            <p>All data is processed strictly in-memory and persisted solely to local device storage (<code>localStorage</code> / <code>IndexedDB</code>). The application transmits zero analytics, zero crash telemetry, and zero user identifiers to remote servers.</p>
          </div>

          <div class="legal-section">
            <h4>3. Intellectual Property & Employer Independence</h4>
            <p>Developed entirely on personal time and personal non-employer hardware. This project is independent of, and not sponsored, endorsed, or affiliated with, any employer, cloud platform, or corporate entity.</p>
          </div>

          <div class="legal-section">
            <h4>4. Procedural & Open Assets</h4>
            <p>All sounds, graphics, animations, and icons are generated 100% procedurally in browser code (HTML5 Canvas & Web Audio API) with zero proprietary third-party assets.</p>
          </div>
        </div>
      `,
    });
  }
}
