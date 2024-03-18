import cheerio from "cheerio";
import fs from "fs";
import * as babelParser from "@babel/parser";
import _traverse from "@babel/traverse";
import { JSXAttribute } from "@babel/types";
let traverse: typeof _traverse;
// @ts-ignore - This is a workaround for a bug in the imports for @babel/traverse
if (_traverse.default) {
  // @ts-ignore - This is a workaround for a bug in the imports for @babel/traverse
  traverse = _traverse.default;
} else {
  traverse = _traverse;
}

export function parseHtmlFileContent(
  htmlContent: string,
  server: string,
  relative: boolean
): string[] {
  const $ = cheerio.load(htmlContent);
  const links: string[] = [];

  $("[href]").each((_, element) => {
    const href = $(element).attr("href");
    let formattedLink: string | null | undefined = null;

    if (href?.includes("http")) {
      formattedLink = href;
    } else if (
      href &&
      relative &&
      !href.startsWith("#") &&
      !href.startsWith("{") &&
      !href.includes("mailto:") &&
      !href.includes("tel:") &&
      !href.includes("javascript:") &&
      !href.includes("data:") &&
      !href.includes("file:") &&
      !href.includes("ftp:") &&
      !href.includes("irc:") &&
      !href.includes("magnet:") &&
      !href.includes("news:") &&
      !href.includes("nntp:") &&
      !href.includes("sip:") &&
      !href.includes("sms:") &&
      !href.includes("smsto:") &&
      !href.includes("ssh:") &&
      !href.includes("://") &&
      !href.includes("${") &&
      !(href === "#")
    ) {
      formattedLink = `${server}${href}`;
    }
    if (formattedLink) {
      links.push(formattedLink);
    }
  });

  return links;
}

export function parseJSXorTSXFile(
  filePath: string,
  server: string,
  relative: boolean
): { links: string[]; fileName?: string } {
  const code = fs.readFileSync(filePath, "utf8");
  const ast = babelParser.parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  const links: string[] = [];

  traverse(ast, {
    JSXOpeningElement({ node }) {
      const hrefAttribute = node.attributes.find(
        (attribute): attribute is JSXAttribute =>
          attribute.type === "JSXAttribute" && attribute.name.name === "href"
      );

      if (hrefAttribute && hrefAttribute.value?.type === "StringLiteral") {
        const href = hrefAttribute.value.value;
        let formattedLink: string | null = null;
        if (hrefAttribute.value.value.includes("http")) {
          formattedLink = href;
        } else if (
          relative &&
          !href.startsWith("#") &&
          !href.startsWith("{") &&
          !href.includes("mailto:") &&
          !href.includes("tel:") &&
          !href.includes("javascript:") &&
          !href.includes("data:") &&
          !href.includes("file:") &&
          !href.includes("ftp:") &&
          !href.includes("irc:") &&
          !href.includes("magnet:") &&
          !href.includes("news:") &&
          !href.includes("nntp:") &&
          !href.includes("sip:") &&
          !href.includes("sms:") &&
          !href.includes("smsto:") &&
          !href.includes("ssh:") &&
          !href.includes("://") &&
          !href.includes("${") &&
          !(href === "#")
        ) {
          formattedLink = `${server}${href}`;
        }
        if (formattedLink) {
          links.push(formattedLink);
        }
      }
    },
  });

  return { links: links, fileName: filePath.split("/").pop() };
}

export function parseVueFile(
  filePath: string,
  server: string,
  relative: boolean
): { links: string[]; fileName?: string } | null {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const templateMatch = fileContent.match(/<template>([\s\S]*?)<\/template>/);
  if (!templateMatch) return null;

  const templateContent = templateMatch[1];
  return {
    links: parseHtmlFileContent(templateContent, server, relative),
    fileName: filePath.split("/").pop(),
  };
}

export function parseSvelteFile(
  filePath: string,
  server: string,
  relative: boolean
): { links: string[]; fileName?: string } {
  const fileContent = fs.readFileSync(filePath, "utf8");
  return {
    links: parseHtmlFileContent(fileContent, server, relative),
    fileName: filePath.split("/").pop(),
  };
}

export function parseAstroFile(
  filePath: string,
  server: string,
  relative: boolean
): { links: string[]; fileName?: string } {
  const fileContent = fs.readFileSync(filePath, "utf8");
  // Extract the content outside of frontmatter (if present)
  const contentWithoutFrontmatter = fileContent
    .split("---")
    .slice(2)
    .join("---");
  return {
    links: parseHtmlFileContent(contentWithoutFrontmatter, server, relative),
    fileName: filePath.split("/").pop(),
  };
}

export function parseHtmlFile(
  filePath: string,
  server: string,
  relative: boolean
): { links: string[]; fileName?: string } {
  const fileContent = fs.readFileSync(filePath, "utf8");
  return {
    links: parseHtmlFileContent(fileContent, server, relative),
    fileName: filePath.split("/").pop(),
  };
}
