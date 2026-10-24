/**
 * ShareService - Invokes Native iOS Share Sheet (AirDrop, Messages, Notes) with Clipboard Fallback.
 */
export class ShareService {
  static isSupported() {
    return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  }

  static async share({ title, text, url, files } = {}) {
    const shareData = {};
    if (title) shareData.title = title;
    if (text) shareData.text = text;
    if (url) shareData.url = url;
    if (files && Array.isArray(files) && files.length > 0) {
      if (typeof navigator.canShare === 'function' && navigator.canShare({ files })) {
        shareData.files = files;
      }
    }

    if (this.isSupported()) {
      try {
        await navigator.share(shareData);
        return { success: true, method: 'native' };
      } catch (err) {
        if (err.name === 'AbortError') {
          return { success: false, reason: 'cancelled' };
        }
        // Fall back to clipboard if native share fails
      }
    }

    // Fallback: Copy URL or text to clipboard
    const copyTarget = url || text || title || '';
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(copyTarget);
        return { success: true, method: 'clipboard' };
      } catch (clipErr) {
        return { success: false, reason: clipErr.message };
      }
    }

    return { success: false, reason: 'unsupported' };
  }
}
