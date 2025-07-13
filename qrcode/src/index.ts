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

    // Get QR code options and output type from request body
    const body = event.body ? JSON.parse(event.body) : {};
    const qrCodeOptions: QRCodeOptions = body.qrCodeOptions || {};
    const outputType: "png" | "svg" = body.outputType === "svg" ? "svg" : "png"; // Default is 'png'

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
