import fs from "fs";
import path from "path";
import chalk from "chalk";

import {
  parseAstroFile,
  parseHtmlFile,
  parseJSXorTSXFile,
  parseSvelteFile,
  parseVueFile,
} from "./parsing";
import { isLinkWorking } from "./linkChecker";

const results: {
  filePath: string;
  linkTestResults: {
    success: boolean;
    url: string;
    error?: string | undefined;
  }[];
  links: { links: string[]; fileName?: string };
}[] = [];

export async function main(
  dir: string,
  ignoredDirectories: string[],
  server: string,
  verbose?: boolean,
  relative?: boolean
) {
  await scanFiles(dir, ignoredDirectories, server, verbose, relative);

  if (results.length) {
    const allResults = results.reduce<
      {
        success: boolean;
        url: string;
        error?: string | undefined;
        path?: string;
      }[]
    >((acc, result) => {
      const filePath = result.filePath;
      const app = result.linkTestResults.map((link) => ({
        success: link.success,
        url: link.url,
        error: link.error,
        path: filePath,
      }));
      return acc.concat(app);
    }, []);

    if (verbose) {
      results.forEach((result) => {
        console.log(
          chalk.green(`Found links in ${result.filePath}:`),
          result.links
        );
      });
    }
    const workingLinks = allResults.filter((result) => result.success);
    const brokenLinks = allResults.filter((result) => !result.success);

    console.log(chalk.bold("Link Check Summary:"));
    console.log(
      chalk.blue(`Number of Successful Links: ${workingLinks.length}`)
    );
    console.log(chalk.red(`Number of Broken Links: ${brokenLinks.length}`));
    if (brokenLinks.length) {
      console.log(
        chalk.red(
          `Broken Links: ${brokenLinks.map(
            (link) => `${link.url} in ${link.path}`
          )} `
        )
      );
    }
  }
}

/**
 * Recursively scan a directory for files.
 * @param dir The directory to start scanning from.
 * @param fileProcessFunction The function to call with each file path.
 * @param ignoredDirectories An array of directories to ignore.
 * @param server The local development server URL.
 * @param verbose Whether to log the results of each file.
 * @param relative Whether to check relative links.
 */
export async function scanFiles(
  dir: string,
  ignoredDirectories: string[],
  server: string,
  verbose?: boolean,
  relative?: boolean,
  fileProcessFunction: (
    filePath: string,
    server: string,
    verbose: boolean,
    relative: boolean
  ) => void = processFile
): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, { withFileTypes: true }, async (err, dirents) => {
      if (err) {
        console.error("Error reading directory", dir, err);
        return;
      }

      const tasks = dirents.map(async (dirent) => {
        const res = path.resolve(dir, dirent.name);
        const shouldIgnore = ignoredDirectories.some((ignoredDir) =>
          res.includes(path.normalize(ignoredDir))
        );

        if (shouldIgnore) {
          return;
        }

        if (dirent.isDirectory()) {
          await scanFiles(
            res,
            ignoredDirectories,
            server,
            verbose,
            relative,
            fileProcessFunction
          );
        } else {
          await fileProcessFunction(
            res,
            server,
            verbose ?? false,
            relative ?? false
          );
        }
      });
      await Promise.all(tasks);
      resolve();
    });
  });
}

export async function processFile(
  filePath: string,
  server: string,
  verbose: boolean,
  relative: boolean
): Promise<void> {
  const ext = path.extname(filePath);
  let result: { links: string[]; fileName?: string } | null;
  let linkTestResults = [];

  switch (ext) {
    case ".html":
      result = parseHtmlFile(filePath, server, relative ?? false);
      break;
    case ".jsx":
    case ".tsx":
      result = parseJSXorTSXFile(filePath, server, relative ?? false);
      break;
    case ".vue":
      result = parseVueFile(filePath, server, relative ?? false);
      break;
    case ".svelte":
      result = parseSvelteFile(filePath, server, relative ?? false);
      break;
    case ".astro":
      result = parseAstroFile(filePath, server, relative ?? false);
      break;
    default:
      // console.log(`Unsupported file type: ${ext}`);
      return;
  }
  if (!result) return;
  for (const link of result.links) {
    const serverRunning = await isLinkWorking(server);
    if (!serverRunning.success) {
      console.error(
        chalk.red(
          `Development server ${server} is not running, please ensure you have started your dev server`
        )
      );
      return;
    }
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

  if (result.links.length) {
    results.push({ filePath, linkTestResults, links: result });
  }
}
