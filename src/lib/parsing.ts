import cheerio from "cheerio";
import fs from "fs";
import * as babelParser from "@babel/parser";
import _traverse from "@babel/traverse";
import { JSXAttribute } from "@babel/types";
// @ts-ignore - This is a workaround for a bug in the imports for @babel/traverse
const traverse: typeof _traverse = _traverse.default;

export function parseHtmlFileContent(htmlContent: string): string[] {
  const $ = cheerio.load(htmlContent);
  const links: string[] = [];

  $("[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (href && href.includes("http")) {
      links.push(href);
    }
  });

  return links;
}

export function parseJSXorTSXFile(filePath: string): string[] {
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

      if (
        hrefAttribute &&
        hrefAttribute.value?.type === "StringLiteral" &&
        hrefAttribute.value.value.includes("http")
      ) {
        links.push(hrefAttribute.value.value);
      }
    },
  });

  return links;
}

export function parseVueFile(filePath: string): string[] {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const templateMatch = fileContent.match(/<template>([\s\S]*?)<\/template>/);
  if (!templateMatch) return [];

  const templateContent = templateMatch[1];
  return parseHtmlFileContent(templateContent);
}

export function parseSvelteFile(filePath: string): string[] {
  const fileContent = fs.readFileSync(filePath, "utf8");
  return parseHtmlFileContent(fileContent);
}

export function parseAstroFile(filePath: string): string[] {
  const fileContent = fs.readFileSync(filePath, "utf8");
  // Extract the content outside of frontmatter (if present)
  const contentWithoutFrontmatter = fileContent
    .split("---")
    .slice(2)
    .join("---");
  return parseHtmlFileContent(contentWithoutFrontmatter);
}
