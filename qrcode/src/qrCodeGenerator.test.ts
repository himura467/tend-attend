// import fs from "fs";
// import path from "path";
import { describe, expect, it } from "vitest";
import { generateQRCode, QRCodeOptions } from "./qrCodeGenerator";

describe("generateQRCode", () => {
  it("should generate a PNG QR code with default options", async () => {
    const options = {
      data: "https://vitest.dev",
    };
    const buffer = await generateQRCode(options, "png"); // outputType を 'png' に指定
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000); // ある程度のサイズがあることを確認

    // デバッグ用にファイルを保存する場合 (テスト実行後に手動で削除)
    // fs.writeFileSync(path.resolve(__dirname, './test-default.png'), buffer);
  }, 10000); // タイムアウトを 10 秒に設定

  it("should generate a PNG QR code with custom colors and image", async () => {
    const options: QRCodeOptions = {
      width: 200,
      height: 200,
      data: "https://www.facebook.com",
      image: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
      dotsOptions: {
        type: "square",
        color: "#FF0000",
      },
      backgroundOptions: {
        color: "#FFFFCC",
      },
    };
    const buffer = await generateQRCode(options, "png"); // outputType を 'png' に指定
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000);

    // デバッグ用にファイルを保存する場合
    // fs.writeFileSync(path.resolve(__dirname, "./test-custom.png"), buffer);
  }, 10000);

  it("should generate an SVG QR code", async () => {
    const options = {
      data: "https://www.typescriptlang.org",
      dotsOptions: {
        color: "#007ACC",
      },
    };
    const buffer = await generateQRCode(options, "svg"); // outputType を 'svg' に指定
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(500);
    expect(buffer.toString()).toContain("<svg"); // SVG であることを確認

    // デバッグ用にファイルを保存する場合
    // fs.writeFileSync(path.resolve(__dirname, "./test-svg.svg"), buffer);
  }, 10000);

  it("should handle missing data gracefully", async () => {
    const options = {}; // data が不足している
    // generateQRCode が `data` の不足でエラーをスローすることを期待
    await expect(generateQRCode(options, "png")).rejects.toThrow();
  }, 10000);
});
