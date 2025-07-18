// import fs from "fs";
// import path from "path";
import { describe, expect, it } from "vitest";
import { generateQRCode, QRCodeOptions } from "./qrCodeGenerator";

describe("generateQRCode", () => {
  it("should generate a PNG QR code with default options", async () => {
    const options = {
      data: "https://vitest.dev",
    };
    const buffer = await generateQRCode(options, "png"); // Specify outputType as 'png'
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000); // Verify that it has a reasonable size

    // To save file for debugging (manually delete after test execution)
    // fs.writeFileSync(path.resolve(__dirname, './test-default.png'), buffer);
  }, 10000); // Set timeout to 10 seconds

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
    const buffer = await generateQRCode(options, "png"); // Specify outputType as 'png'
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000);

    // To save file for debugging
    // fs.writeFileSync(path.resolve(__dirname, "./test-custom.png"), buffer);
  }, 10000);

  it("should generate an SVG QR code", async () => {
    const options = {
      data: "https://www.typescriptlang.org",
      dotsOptions: {
        color: "#007ACC",
      },
    };
    const buffer = await generateQRCode(options, "svg"); // Specify outputType as 'svg'
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(500);
    expect(buffer.toString()).toContain("<svg"); // Verify that it is SVG

    // To save file for debugging
    // fs.writeFileSync(path.resolve(__dirname, "./test-svg.svg"), buffer);
  }, 10000);

  it("should handle missing data gracefully", async () => {
    const options = {}; // Missing data
    // Expect generateQRCode to throw error due to missing `data`
    await expect(generateQRCode(options, "png")).rejects.toThrow();
  }, 10000);
});
