import { APIGatewayProxyStructuredResultV2, LambdaFunctionURLEvent } from "aws-lambda";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { handler } from "./index";
import * as qrCodeGenerator from "./qrCodeGenerator";

// Mock qrCodeGenerator module
vi.mock("./qrCodeGenerator", () => ({
  generateQRCode: vi.fn(),
}));

const mockGenerateQRCode = vi.mocked(qrCodeGenerator.generateQRCode);

describe("Lambda handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variables
    process.env.DOMAIN_NAME = "example.com";
  });

  it("should generate QR code with PNG format by default", async () => {
    const mockBuffer = Buffer.from("mock-png-data");
    mockGenerateQRCode.mockResolvedValue(mockBuffer);

    const event: LambdaFunctionURLEvent = {
      version: "2.0",
      routeKey: "$default",
      rawPath: "/qrcode/test",
      rawQueryString: "width=256&height=256&outputType=png",
      cookies: [],
      headers: {},
      queryStringParameters: {
        width: "256",
        height: "256",
        outputType: "png",
      },
      requestContext: {
        accountId: "123456789012",
        apiId: "api-id",
        domainName: "example.com",
        domainPrefix: "api",
        http: {
          method: "GET",
          path: "/qrcode/test",
          protocol: "HTTP/1.1",
          sourceIp: "127.0.0.1",
          userAgent: "Custom User Agent String",
        },
        requestId: "id",
        routeKey: "$default",
        stage: "$default",
        time: "12/Mar/2020:19:03:58 +0000",
        timeEpoch: 1583348638390,
      },
      body: undefined,
      pathParameters: {},
      isBase64Encoded: false,
      stageVariables: {},
    };

    const result = (await handler(event)) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(200);
    expect(result.headers?.["Content-Type"]).toBe("image/png");
    expect(result.body).toBe(mockBuffer.toString("base64"));
    expect(result.isBase64Encoded).toBe(true);
    expect(mockGenerateQRCode).toHaveBeenCalledWith(
      {
        width: 256,
        height: 256,
        data: "https://example.com/test",
      },
      "png",
    );
  });

  it("should generate QR code with SVG format when specified", async () => {
    const mockBuffer = Buffer.from("<svg>mock-svg-data</svg>");
    mockGenerateQRCode.mockResolvedValue(mockBuffer);

    const event: LambdaFunctionURLEvent = {
      version: "2.0",
      routeKey: "$default",
      rawPath: "/qrcode/svg-test",
      rawQueryString: "dotsColor=%23FF0000&outputType=svg",
      cookies: [],
      headers: {},
      queryStringParameters: {
        dotsColor: "#FF0000",
        outputType: "svg",
      },
      requestContext: {
        accountId: "123456789012",
        apiId: "api-id",
        domainName: "example.com",
        domainPrefix: "api",
        http: {
          method: "GET",
          path: "/qrcode/svg-test",
          protocol: "HTTP/1.1",
          sourceIp: "127.0.0.1",
          userAgent: "Custom User Agent String",
        },
        requestId: "id",
        routeKey: "$default",
        stage: "$default",
        time: "12/Mar/2020:19:03:58 +0000",
        timeEpoch: 1583348638390,
      },
      body: undefined,
      pathParameters: {},
      isBase64Encoded: false,
      stageVariables: {},
    };

    const result = (await handler(event)) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(200);
    expect(result.headers?.["Content-Type"]).toBe("image/svg+xml");
    expect(result.body).toBe(mockBuffer.toString("base64"));
    expect(result.isBase64Encoded).toBe(true);
    expect(mockGenerateQRCode).toHaveBeenCalledWith(
      {
        dotsOptions: {
          color: "#FF0000",
        },
        data: "https://example.com/svg-test",
      },
      "svg",
    );
  });

  it("should return 400 error when path doesn't contain /qrcode", async () => {
    const event: LambdaFunctionURLEvent = {
      version: "2.0",
      routeKey: "$default",
      rawPath: "/invalid/path",
      rawQueryString: "",
      cookies: [],
      headers: {},
      queryStringParameters: {},
      requestContext: {
        accountId: "123456789012",
        apiId: "api-id",
        domainName: "example.com",
        domainPrefix: "api",
        http: {
          method: "GET",
          path: "/invalid/path",
          protocol: "HTTP/1.1",
          sourceIp: "127.0.0.1",
          userAgent: "Custom User Agent String",
        },
        requestId: "id",
        routeKey: "$default",
        stage: "$default",
        time: "12/Mar/2020:19:03:58 +0000",
        timeEpoch: 1583348638390,
      },
      body: undefined,
      pathParameters: {},
      isBase64Encoded: false,
      stageVariables: {},
    };

    const result = (await handler(event)) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(400);
    expect(result.headers?.["Content-Type"]).toBe("application/json");
    expect(JSON.parse(result.body as string)).toEqual({
      message: "Invalid path: must start with /qrcode/",
    });
    expect(mockGenerateQRCode).not.toHaveBeenCalled();
  });

  it("should return 400 error when path contains /qrcode but not /qrcode/", async () => {
    const event: LambdaFunctionURLEvent = {
      version: "2.0",
      routeKey: "$default",
      rawPath: "/qrcodeabc",
      rawQueryString: "",
      cookies: [],
      headers: {},
      queryStringParameters: {},
      requestContext: {
        accountId: "123456789012",
        apiId: "api-id",
        domainName: "example.com",
        domainPrefix: "api",
        http: {
          method: "GET",
          path: "/qrcodeabc",
          protocol: "HTTP/1.1",
          sourceIp: "127.0.0.1",
          userAgent: "Custom User Agent String",
        },
        requestId: "id",
        routeKey: "$default",
        stage: "$default",
        time: "12/Mar/2020:19:03:58 +0000",
        timeEpoch: 1583348638390,
      },
      body: undefined,
      pathParameters: {},
      isBase64Encoded: false,
      stageVariables: {},
    };

    const result = (await handler(event)) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(400);
    expect(result.headers?.["Content-Type"]).toBe("application/json");
    expect(JSON.parse(result.body as string)).toEqual({
      message: "Invalid path: must start with /qrcode/",
    });
    expect(mockGenerateQRCode).not.toHaveBeenCalled();
  });

  it("should return 400 error when path has /qrcode/ in the middle", async () => {
    const event: LambdaFunctionURLEvent = {
      version: "2.0",
      routeKey: "$default",
      rawPath: "/abc/qrcode/test",
      rawQueryString: "",
      cookies: [],
      headers: {},
      queryStringParameters: {},
      requestContext: {
        accountId: "123456789012",
        apiId: "api-id",
        domainName: "example.com",
        domainPrefix: "api",
        http: {
          method: "GET",
          path: "/abc/qrcode/test",
          protocol: "HTTP/1.1",
          sourceIp: "127.0.0.1",
          userAgent: "Custom User Agent String",
        },
        requestId: "id",
        routeKey: "$default",
        stage: "$default",
        time: "12/Mar/2020:19:03:58 +0000",
        timeEpoch: 1583348638390,
      },
      body: undefined,
      pathParameters: {},
      isBase64Encoded: false,
      stageVariables: {},
    };

    const result = (await handler(event)) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(400);
    expect(result.headers?.["Content-Type"]).toBe("application/json");
    expect(JSON.parse(result.body as string)).toEqual({
      message: "Invalid path: must start with /qrcode/",
    });
    expect(mockGenerateQRCode).not.toHaveBeenCalled();
  });

  it("should return 500 error when QR code generation fails", async () => {
    const mockError = new Error("QR code generation failed");
    mockGenerateQRCode.mockRejectedValue(mockError);

    const event: LambdaFunctionURLEvent = {
      version: "2.0",
      routeKey: "$default",
      rawPath: "/qrcode/error-test",
      rawQueryString: "",
      cookies: [],
      headers: {},
      queryStringParameters: {},
      requestContext: {
        accountId: "123456789012",
        apiId: "api-id",
        domainName: "example.com",
        domainPrefix: "api",
        http: {
          method: "GET",
          path: "/qrcode/error-test",
          protocol: "HTTP/1.1",
          sourceIp: "127.0.0.1",
          userAgent: "Custom User Agent String",
        },
        requestId: "id",
        routeKey: "$default",
        stage: "$default",
        time: "12/Mar/2020:19:03:58 +0000",
        timeEpoch: 1583348638390,
      },
      body: undefined,
      pathParameters: {},
      isBase64Encoded: false,
      stageVariables: {},
    };

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = (await handler(event)) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(500);
    expect(result.headers?.["Content-Type"]).toBe("application/json");
    expect(JSON.parse(result.body as string)).toEqual({
      message: "Failed to generate QR code",
      error: "QR code generation failed",
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error generating QR code:", mockError);

    consoleErrorSpy.mockRestore();
  });

  it("should handle empty query parameters gracefully", async () => {
    const event: LambdaFunctionURLEvent = {
      version: "2.0",
      routeKey: "$default",
      rawPath: "/qrcode/empty-params",
      rawQueryString: "",
      cookies: [],
      headers: {},
      queryStringParameters: {},
      requestContext: {
        accountId: "123456789012",
        apiId: "api-id",
        domainName: "example.com",
        domainPrefix: "api",
        http: {
          method: "GET",
          path: "/qrcode/empty-params",
          protocol: "HTTP/1.1",
          sourceIp: "127.0.0.1",
          userAgent: "Custom User Agent String",
        },
        requestId: "id",
        routeKey: "$default",
        stage: "$default",
        time: "12/Mar/2020:19:03:58 +0000",
        timeEpoch: 1583348638390,
      },
      body: undefined,
      pathParameters: {},
      isBase64Encoded: false,
      stageVariables: {},
    };

    const mockBuffer = Buffer.from("mock-default-data");
    mockGenerateQRCode.mockResolvedValue(mockBuffer);

    const result = (await handler(event)) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(200);
    expect(result.headers?.["Content-Type"]).toBe("image/png");
    expect(mockGenerateQRCode).toHaveBeenCalledWith(
      {
        data: "https://example.com/empty-params",
      },
      "png",
    );
  });

  it("should construct correct URL when rawPath has complex path after /qrcode/", async () => {
    const mockBuffer = Buffer.from("mock-data");
    mockGenerateQRCode.mockResolvedValue(mockBuffer);

    const event: LambdaFunctionURLEvent = {
      version: "2.0",
      routeKey: "$default",
      rawPath: "/qrcode/user/123/profile",
      rawQueryString: "",
      cookies: [],
      headers: {},
      queryStringParameters: {},
      requestContext: {
        accountId: "123456789012",
        apiId: "api-id",
        domainName: "example.com",
        domainPrefix: "api",
        http: {
          method: "GET",
          path: "/qrcode/user/123/profile",
          protocol: "HTTP/1.1",
          sourceIp: "127.0.0.1",
          userAgent: "Custom User Agent String",
        },
        requestId: "id",
        routeKey: "$default",
        stage: "$default",
        time: "12/Mar/2020:19:03:58 +0000",
        timeEpoch: 1583348638390,
      },
      body: undefined,
      pathParameters: {},
      isBase64Encoded: false,
      stageVariables: {},
    };

    const result = (await handler(event)) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(200);
    expect(mockGenerateQRCode).toHaveBeenCalledWith(
      {
        data: "https://example.com/user/123/profile",
      },
      "png",
    );
  });

  it("should generate QR code with custom styling options via query parameters", async () => {
    const mockBuffer = Buffer.from("mock-styled-data");
    mockGenerateQRCode.mockResolvedValue(mockBuffer);

    const event: LambdaFunctionURLEvent = {
      version: "2.0",
      routeKey: "$default",
      rawPath: "/qrcode/styled-test",
      rawQueryString:
        "width=300&dotsType=rounded&dotsColor=%23FF0000&cornersSquareType=extra-rounded&cornersSquareColor=%230000FF&backgroundColor=%23FFFFFF",
      cookies: [],
      headers: {},
      queryStringParameters: {
        width: "300",
        dotsType: "rounded",
        dotsColor: "#FF0000",
        cornersSquareType: "extra-rounded",
        cornersSquareColor: "#0000FF",
        backgroundColor: "#FFFFFF",
      },
      requestContext: {
        accountId: "123456789012",
        apiId: "api-id",
        domainName: "example.com",
        domainPrefix: "api",
        http: {
          method: "GET",
          path: "/qrcode/styled-test",
          protocol: "HTTP/1.1",
          sourceIp: "127.0.0.1",
          userAgent: "Custom User Agent String",
        },
        requestId: "id",
        routeKey: "$default",
        stage: "$default",
        time: "12/Mar/2020:19:03:58 +0000",
        timeEpoch: 1583348638390,
      },
      body: undefined,
      pathParameters: {},
      isBase64Encoded: false,
      stageVariables: {},
    };

    const result = (await handler(event)) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(200);
    expect(result.headers?.["Content-Type"]).toBe("image/png");
    expect(mockGenerateQRCode).toHaveBeenCalledWith(
      {
        width: 300,
        dotsOptions: {
          type: "rounded",
          color: "#FF0000",
        },
        cornersSquareOptions: {
          type: "extra-rounded",
          color: "#0000FF",
        },
        backgroundOptions: {
          color: "#FFFFFF",
        },
        data: "https://example.com/styled-test",
      },
      "png",
    );
  });

  it("should generate QR code with QR options via query parameters", async () => {
    const mockBuffer = Buffer.from("mock-qr-options-data");
    mockGenerateQRCode.mockResolvedValue(mockBuffer);

    const event: LambdaFunctionURLEvent = {
      version: "2.0",
      routeKey: "$default",
      rawPath: "/qrcode/qr-options-test",
      rawQueryString: "errorCorrectionLevel=H&mode=Byte&typeNumber=10",
      cookies: [],
      headers: {},
      queryStringParameters: {
        errorCorrectionLevel: "H",
        mode: "Byte",
        typeNumber: "10",
      },
      requestContext: {
        accountId: "123456789012",
        apiId: "api-id",
        domainName: "example.com",
        domainPrefix: "api",
        http: {
          method: "GET",
          path: "/qrcode/qr-options-test",
          protocol: "HTTP/1.1",
          sourceIp: "127.0.0.1",
          userAgent: "Custom User Agent String",
        },
        requestId: "id",
        routeKey: "$default",
        stage: "$default",
        time: "12/Mar/2020:19:03:58 +0000",
        timeEpoch: 1583348638390,
      },
      body: undefined,
      pathParameters: {},
      isBase64Encoded: false,
      stageVariables: {},
    };

    const result = (await handler(event)) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(200);
    expect(result.headers?.["Content-Type"]).toBe("image/png");
    expect(mockGenerateQRCode).toHaveBeenCalledWith(
      {
        qrOptions: {
          errorCorrectionLevel: "H",
          mode: "Byte",
          typeNumber: 10,
        },
        data: "https://example.com/qr-options-test",
      },
      "png",
    );
  });

  it("should generate QR code with image options via query parameters", async () => {
    const mockBuffer = Buffer.from("mock-image-options-data");
    mockGenerateQRCode.mockResolvedValue(mockBuffer);

    const event: LambdaFunctionURLEvent = {
      version: "2.0",
      routeKey: "$default",
      rawPath: "/qrcode/image-options-test",
      rawQueryString: "image=https%3A%2F%2Fexample.com%2Flogo.png&hideBackgroundDots=true&imageSize=0.4&imageMargin=5",
      cookies: [],
      headers: {},
      queryStringParameters: {
        image: "https://example.com/logo.png",
        hideBackgroundDots: "true",
        imageSize: "0.4",
        imageMargin: "5",
      },
      requestContext: {
        accountId: "123456789012",
        apiId: "api-id",
        domainName: "example.com",
        domainPrefix: "api",
        http: {
          method: "GET",
          path: "/qrcode/image-options-test",
          protocol: "HTTP/1.1",
          sourceIp: "127.0.0.1",
          userAgent: "Custom User Agent String",
        },
        requestId: "id",
        routeKey: "$default",
        stage: "$default",
        time: "12/Mar/2020:19:03:58 +0000",
        timeEpoch: 1583348638390,
      },
      body: undefined,
      pathParameters: {},
      isBase64Encoded: false,
      stageVariables: {},
    };

    const result = (await handler(event)) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(200);
    expect(result.headers?.["Content-Type"]).toBe("image/png");
    expect(mockGenerateQRCode).toHaveBeenCalledWith(
      {
        image: "https://example.com/logo.png",
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.4,
          margin: 5,
        },
        data: "https://example.com/image-options-test",
      },
      "png",
    );
  });
});
