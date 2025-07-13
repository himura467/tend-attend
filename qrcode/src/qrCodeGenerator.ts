import nodeCanvas from "canvas";
import { JSDOM } from "jsdom";
import QRCodeStyling, { Options as QRCodeOptions } from "qr-code-styling";

/**
 * Function to generate customizable QR codes
 * @param options QR code generation options
 * @param outputType Output format of QR code to generate ('png' or 'svg')
 * @returns Buffer of generated QR code
 */
export async function generateQRCode(options: QRCodeOptions, outputType: "png" | "svg" = "png"): Promise<Buffer> {
  const defaultOptions: QRCodeOptions = {
    type: outputType === "svg" ? "svg" : "canvas", // Set 'svg' or 'canvas' based on output type
    shape: "square",
    width: 300,
    height: 300,
    imageOptions: {
      saveAsBlob: true, // Required to handle as Buffer in Lambda
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

  // Pass JSDOM and nodeCanvas according to qr-code-styling library requirements
  const qrCode = new QRCodeStyling({
    nodeCanvas: nodeCanvas,
    jsdom: JSDOM,
    ...mergedOptions,
  });

  // Get RawData according to specified outputType
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
