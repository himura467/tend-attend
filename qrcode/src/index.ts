import { LambdaFunctionURLEvent, LambdaFunctionURLResult } from "aws-lambda";
import { generateQRCode, QRCodeOptions } from "./qrCodeGenerator";

/**
 * AWS Lambda ハンドラ関数
 * @param event Lambda function URLs からのイベント
 * @returns HTTP レスポンス
 */
export const handler = async (event: LambdaFunctionURLEvent): Promise<LambdaFunctionURLResult> => {
  try {
    const domainName = process.env.DOMAIN_NAME;
    // 環境変数 DOMAIN_NAME が設定されていない場合はエラーを投げる
    if (!domainName) {
      throw new Error("DOMAIN_NAME environment variable is not set");
    }

    // リクエストボディから QR コードのオプションと出力タイプを取得
    const body = event.body ? JSON.parse(event.body) : {};
    const qrCodeOptions: QRCodeOptions = body.qrCodeOptions || {};
    const outputType: "png" | "svg" = body.outputType === "svg" ? "svg" : "png"; // デフォルトは 'png'

    const rawPath = event.rawPath || "";

    // パスが /qrcode/ で始まることを確認
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

    // data を qrCodeOptions に設定
    qrCodeOptions.data = data;

    // QR コードを生成
    const qrCodeBuffer = await generateQRCode(qrCodeOptions, outputType);

    // 生成された QR コードのタイプに応じて Content-Type を設定
    const contentType = outputType === "svg" ? "image/svg+xml" : "image/png";

    return {
      statusCode: 200,
      headers: { "Content-Type": contentType },
      body: qrCodeBuffer.toString("base64"), // バイナリデータを Base64 エンコードして返す
      isBase64Encoded: true, // Base64 エンコードされていることを Lambda に伝える
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
