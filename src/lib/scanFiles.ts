import fs from "fs";
import path from "path";
import chalk from "chalk";

import {
  parseAstroFile,
  parseHtmlFileContent,
  parseJSXorTSXFile,
  parseSvelteFile,
  parseVueFile,
} from "./parsing";
import { isLinkWorking } from "./linkChecker";
/**
 * Recursively scan a directory for files.
 * @param dir The directory to start scanning from.
 * @param fileProcessFunction The function to call with each file path.
 * @param ignoredDirectories An array of directories to ignore.
 * @param verbose Whether to log the results of each file.
 */
export function scanFiles(
  dir: string,
  ignoredDirectories: string[],
  verbose?: boolean,
  fileProcessFunction: (filePath: string) => void = processFile
): void {
  fs.readdir(dir, { withFileTypes: true }, (err, dirents) => {
    if (err) {
      console.error("Error reading directory", dir, err);
      return;
    }

    for (const dirent of dirents) {
      const res = path.resolve(dir, dirent.name);
      const shouldIgnore = ignoredDirectories.some((ignoredDir) =>
        res.includes(path.normalize(ignoredDir))
      );
      if (shouldIgnore) {
        continue;
      }
      if (dirent.isDirectory()) {
        scanFiles(res, ignoredDirectories, verbose, fileProcessFunction);
      } else {
        fileProcessFunction(res);
      }
    }
  });
}

export async function processFile(
  filePath: string,
  verbose?: boolean
): Promise<void> {
  const ext = path.extname(filePath);
  let links: string[] = [];

  switch (ext) {
    case ".html":
      links = parseHtmlFileContent(filePath);
      break;
    case ".jsx":
    case ".tsx":
      links = parseJSXorTSXFile(filePath);
      break;
    case ".vue":
      links = parseVueFile(filePath);
      break;
    case ".svelte":
      links = parseSvelteFile(filePath);
      break;
    case ".astro":
      links = parseAstroFile(filePath);
      break;
    default:
      // console.log(`Unsupported file type: ${ext}`);
      return;
  }
  let linkTestResults = [];
  for (const link of links) {
    const working = await isLinkWorking(link);
    linkTestResults.push(working);

    if (verbose) {
      if (working) {
        console.log(chalk.blue(`${link} is working`)); // Blue color for working links
      } else {
        console.log(chalk.red(`${link} is broken`)); // Red color for broken links
      }
    }
  }

  if (links.length) {
    const workingLinks = linkTestResults.filter((result) => result.success);
    const brokenLinks = linkTestResults.filter((result) => !result.success);
    if (verbose) {
      console.log(chalk.green(`Found links in ${filePath}:`), links);
    }
    console.log(chalk.bold("Link Check Summary:"));
    console.log(
      chalk.blue(`Number of Successful Links: ${workingLinks.length}`)
    );
    console.log(chalk.red(`Number of Broken Links: ${brokenLinks.length}`));
    if (brokenLinks.length) {
      console.log(
        chalk.red(`Broken Links: ${brokenLinks.map((link) => link.url)}`)
      );
    }
  }
}
