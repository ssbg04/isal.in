declare module 'gifenc' {
  export interface GIFEncoderOptions {
    initialCapacity?: number;
    auto?: boolean;
  }

  export interface WriteFrameOptions {
    palette?: number[][] | Uint8Array | null;
    delay?: number;
    repeat?: number;
    transparent?: boolean;
    transparentIndex?: number;
    dispose?: number;
    colorDepth?: number;
    first?: boolean;
  }

  export interface GIFEncoderInstance {
    reset(): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    buffer: ArrayBuffer;
    stream: any;
    writeHeader(): void;
    writeFrame(index: Uint8Array | number[], width: number, height: number, opts?: WriteFrameOptions): void;
  }

  export function GIFEncoder(opt?: GIFEncoderOptions): GIFEncoderInstance;
  export function quantize(rgbaData: Uint8Array | Uint8ClampedArray, maxColors: number, opt?: any): number[][];
  export function applyPalette(rgbaData: Uint8Array | Uint8ClampedArray, palette: number[][], format?: string): Uint8Array;
}

