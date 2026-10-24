/**
 * CameraService - Camera Viewfinder, Torch Toggle & BarcodeDetector Stream Bridge.
 */
export class CameraService {
  constructor({ formats = ['qr_code', 'ean_13', 'upc_a', 'upc_e', 'code_128'] } = {}) {
    this.formats = formats;
    this.stream = null;
    this.videoEl = null;
    this.detector = null;
    this.isScanning = false;
    this.scanInterval = null;
    this.torchActive = false;

    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        this.detector = new window.BarcodeDetector({ formats: this.formats });
      } catch (e) {
        console.warn('[CameraService] BarcodeDetector init failed:', e);
      }
    }
  }

  isSupported() {
    return (
      typeof navigator !== 'undefined' &&
      'mediaDevices' in navigator &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    );
  }

  hasBarcodeDetector() {
    return Boolean(this.detector);
  }

  async start({ videoElement, onDetected } = {}) {
    if (!this.isSupported()) {
      throw new Error('Camera mediaDevices API is not supported on this device.');
    }

    this.videoEl = videoElement;

    const constraints = {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    };

    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    if (this.videoEl) {
      this.videoEl.srcObject = this.stream;
      this.videoEl.setAttribute('playsinline', 'true');
      await this.videoEl.play();
    }

    if (this.detector && typeof onDetected === 'function') {
      this._startScanLoop(onDetected);
    }

    return true;
  }

  _startScanLoop(onDetected) {
    this.isScanning = true;
    const checkFrame = async () => {
      if (!this.isScanning || !this.videoEl || this.videoEl.readyState < 2) {
        if (this.isScanning) {
          this.scanInterval = requestAnimationFrame(checkFrame);
        }
        return;
      }

      try {
        const barcodes = await this.detector.detect(this.videoEl);
        if (barcodes && barcodes.length > 0) {
          const rawValue = barcodes[0].rawValue;
          if (rawValue) {
            onDetected(rawValue);
          }
        }
      } catch {}

      if (this.isScanning) {
        this.scanInterval = requestAnimationFrame(checkFrame);
      }
    };

    this.scanInterval = requestAnimationFrame(checkFrame);
  }

  async toggleTorch() {
    if (!this.stream) return false;
    const track = this.stream.getVideoTracks()[0];
    if (!track) return false;

    const capabilities = track.getCapabilities ? track.getCapabilities() : {};
    if (!capabilities.torch) return false;

    try {
      this.torchActive = !this.torchActive;
      await track.applyConstraints({
        advanced: [{ torch: this.torchActive }],
      });
      return this.torchActive;
    } catch {
      return false;
    }
  }

  stop() {
    this.isScanning = false;
    if (this.scanInterval) {
      cancelAnimationFrame(this.scanInterval);
      this.scanInterval = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.videoEl) {
      this.videoEl.srcObject = null;
      this.videoEl = null;
    }
    this.torchActive = false;
  }
}
