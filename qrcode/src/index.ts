import { LambdaFunctionURLEvent, LambdaFunctionURLResult } from "aws-lambda";
import { generateQRCode, QRCodeOptions } from "./qrCodeGenerator";

/**
 * AWS Lambda handler function
 * @param event Event from Lambda function URLs
 * @returns HTTP response
 */
export const handler = async (event: LambdaFunctionURLEvent): Promise<LambdaFunctionURLResult> => {
  try {
    const domainName = process.env.DOMAIN_NAME;
    // Throw error if DOMAIN_NAME environment variable is not set
    if (!domainName) {
      throw new Error("DOMAIN_NAME environment variable is not set");
    }

    const rawPath = event.rawPath || "";

    // Verify that path starts with /qrcode/
    const qrCodePattern = "/qrcode/";
    if (!rawPath.startsWith(qrCodePattern)) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Invalid path: must start with /qrcode/" }),
      };
    }

    const pathAfterQRCode = rawPath.substring(qrCodePattern.length);
    const data = `https://${domainName}/${pathAfterQRCode}`;

    // Get QR code options and output type from query parameters
    const queryParams = event.queryStringParameters || {};
    const qrCodeOptions: QRCodeOptions = {};

    // Parse basic options
    if (queryParams.type) qrCodeOptions.type = queryParams.type as "canvas" | "svg";
    if (queryParams.shape) qrCodeOptions.shape = queryParams.shape as "square" | "circle";
    if (queryParams.width) qrCodeOptions.width = parseInt(queryParams.width);
    if (queryParams.height) qrCodeOptions.height = parseInt(queryParams.height);
    if (queryParams.margin) qrCodeOptions.margin = parseInt(queryParams.margin);
    if (queryParams.image) qrCodeOptions.image = queryParams.image;

    // Parse QR options
    if (queryParams.typeNumber || queryParams.mode || queryParams.errorCorrectionLevel) {
      qrCodeOptions.qrOptions = {};
      if (queryParams.typeNumber) qrCodeOptions.qrOptions.typeNumber = parseInt(queryParams.typeNumber) as any;
      if (queryParams.mode)
        qrCodeOptions.qrOptions.mode = queryParams.mode as "Numeric" | "Alphanumeric" | "Byte" | "Kanji";
      if (queryParams.errorCorrectionLevel)
        qrCodeOptions.qrOptions.errorCorrectionLevel = queryParams.errorCorrectionLevel as "L" | "M" | "Q" | "H";
    }

    // Parse image options
    if (queryParams.hideBackgroundDots || queryParams.imageSize || queryParams.imageMargin) {
      qrCodeOptions.imageOptions = {};
      if (queryParams.hideBackgroundDots)
        qrCodeOptions.imageOptions.hideBackgroundDots = queryParams.hideBackgroundDots === "true";
      if (queryParams.imageSize) qrCodeOptions.imageOptions.imageSize = parseFloat(queryParams.imageSize);
      if (queryParams.imageMargin) qrCodeOptions.imageOptions.margin = parseInt(queryParams.imageMargin);
    }

    // Parse dots options
    if (queryParams.dotsType || queryParams.dotsColor) {
      qrCodeOptions.dotsOptions = {};
      if (queryParams.dotsType)
        qrCodeOptions.dotsOptions.type = queryParams.dotsType as
          | "dots"
          | "rounded"
          | "classy"
          | "classy-rounded"
          | "square"
          | "extra-rounded";
      if (queryParams.dotsColor) qrCodeOptions.dotsOptions.color = queryParams.dotsColor;
    }

    // Parse corners square options
    if (queryParams.cornersSquareType || queryParams.cornersSquareColor) {
      qrCodeOptions.cornersSquareOptions = {};
      if (queryParams.cornersSquareType) qrCodeOptions.cornersSquareOptions.type = queryParams.cornersSquareType as any;
      if (queryParams.cornersSquareColor) qrCodeOptions.cornersSquareOptions.color = queryParams.cornersSquareColor;
    }

    // Parse corners dot options
    if (queryParams.cornersDotType || queryParams.cornersDotColor) {
      qrCodeOptions.cornersDotOptions = {};
      if (queryParams.cornersDotType) qrCodeOptions.cornersDotOptions.type = queryParams.cornersDotType as any;
      if (queryParams.cornersDotColor) qrCodeOptions.cornersDotOptions.color = queryParams.cornersDotColor;
    }

    // Parse background options
    if (queryParams.backgroundRound || queryParams.backgroundColor) {
      qrCodeOptions.backgroundOptions = {};
      if (queryParams.backgroundRound) qrCodeOptions.backgroundOptions.round = parseFloat(queryParams.backgroundRound);
      if (queryParams.backgroundColor) qrCodeOptions.backgroundOptions.color = queryParams.backgroundColor;
    }

    const outputType: "png" | "svg" = queryParams.outputType === "svg" ? "svg" : "png"; // Default is 'png'

    // Set data to qrCodeOptions
    qrCodeOptions.data = data;

    // Generate QR code
    const qrCodeBuffer = await generateQRCode(qrCodeOptions, outputType);

    // Set Content-Type based on generated QR code type
    const contentType = outputType === "svg" ? "image/svg+xml" : "image/png";

    return {
      statusCode: 200,
      headers: { "Content-Type": contentType },
      body: qrCodeBuffer.toString("base64"), // Return binary data as Base64 encoded
      isBase64Encoded: true, // Tell Lambda that data is Base64 encoded
    };
  } catch (error) {
    console.error("Error generating QR code:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Failed to generate QR code",
        error: (error as Error).message,
      }),
    };
  }
};
