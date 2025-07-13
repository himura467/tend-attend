import nodeCanvas from "canvas";
import { JSDOM } from "jsdom";
import QRCodeStyling, { Options as QRCodeOptions } from "qr-code-styling";

/**
 * カスタマイズ可能な QR コードを生成する関数
 * @param options QR コード生成オプション
 * @param outputType 生成する QR コードの出力形式 ('png' または 'svg')
 * @returns 生成された QR コードの Buffer
 */
export async function generateQRCode(options: QRCodeOptions, outputType: "png" | "svg" = "png"): Promise<Buffer> {
  const defaultOptions: QRCodeOptions = {
    type: outputType === "svg" ? "svg" : "canvas", // 出力タイプに応じて 'svg' または 'canvas' を設定
    shape: "square",
    width: 300,
    height: 300,
    imageOptions: {
      saveAsBlob: true, // Lambda で Buffer として扱うために必要
      hideBackgroundDots: true,
      imageSize: 0.4,
      crossOrigin: "anonymous",
      margin: 0,
    },
    dotsOptions: {
      type: "square",
      color: "#000000",
    },
    backgroundOptions: {
      color: "#ffffff",
    },
  };

  const mergedOptions: QRCodeOptions = {
    ...defaultOptions,
    ...options,
    imageOptions: {
      ...defaultOptions.imageOptions,
      ...options.imageOptions,
    },
    dotsOptions: {
      ...defaultOptions.dotsOptions,
      ...options.dotsOptions,
    },
    backgroundOptions: {
      ...defaultOptions.backgroundOptions,
      ...options.backgroundOptions,
    },
  };

  // qr-code-styling ライブラリの要件に応じて JSDOM と nodeCanvas を渡す
  const qrCode = new QRCodeStyling({
    nodeCanvas: nodeCanvas,
    jsdom: JSDOM,
    ...mergedOptions,
  });

  // 指定された outputType に応じて RawData を取得
  const rawData = await qrCode.getRawData(outputType);
  if (!rawData) {
    throw new Error("Failed to generate QR code: getRawData returned null");
  }
  if (typeof Buffer !== "undefined" && rawData instanceof Buffer) {
    return rawData;
  }
  if (typeof Blob !== "undefined" && rawData instanceof Blob) {
    const arrayBuffer = await rawData.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  throw new Error("Failed to generate QR code: Unknown data type returned");
}

export { QRCodeOptions };
