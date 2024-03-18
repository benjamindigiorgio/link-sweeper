import {
  parseHtmlFileContent,
  parseJSXorTSXFile,
  parseAstroFile,
  parseSvelteFile,
  parseVueFile,
} from "../src/lib/parsing";

describe("parseHtmlFileContent", () => {
  it("extracts links correctly from HTML content", () => {
    const htmlContent = `
      <html>
      <body>
        <a href="https://example.com">Example</a>
        <a href="https://another.com">Another</a>
      </body>
      </html>
    `;

    const links = parseHtmlFileContent(htmlContent);
    expect(links).toEqual(["https://example.com", "https://another.com"]);
  });
});
