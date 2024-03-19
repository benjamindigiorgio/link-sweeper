// lib/watchDirectory.js
import fs from "fs";
import path from "path";
import {
  parseAstroFile,
  parseHtmlFile,
  parseJSXorTSXFile,
  parseSvelteFile,
  parseVueFile,
} from "./parsing";
import { isLinkWorking } from "./linkChecker";
import chalk from "chalk";
import { debounce } from "./debounce";

const DEBOUNCE_WAIT = 500;

export function watchDirectory(
  dir: string,
  ignoredDirectories: string[],
  server: string,
  relative?: boolean
) {
  console.log(chalk.green(`Watching ${dir} for changes...`));

  const watchOptions = { recursive: true };
  const watcher = fs.watch(
    dir,
    watchOptions,
    debounce(async (eventType, filename) => {
      if (!filename) return;

      const fullPath = path.resolve(dir, filename);
      const isIgnored = ignoredDirectories.some((ignoredDir) =>
        fullPath.includes(ignoredDir)
      );
      if (isIgnored) return;

      try {
        const stat = fs.statSync(fullPath);
        if (stat.isFile()) {
          await processFile(fullPath, server, relative ?? false).catch(
            console.error
          );
        }
      } catch (error: any) {
        console.error(
          chalk.red(`Error processing ${fullPath}: ${error.message}`)
        );
      }
    }, DEBOUNCE_WAIT)
  );

  process.on("SIGINT", () => {
    watcher.close();
    console.log(chalk.blue("Stopped watching for file changes."));
  });
}

const results: {
  filePath: string;
  linkTestResults: {
    success: boolean;
    url: string;
    error?: string | undefined;
  }[];
  links: { links: string[]; fileName?: string };
}[] = [];

export async function scanFilesWatch(
  dir: string,
  ignoredDirectories: string[],
  server: string,
  relative?: boolean,
  fileProcessFunction: (
    filePath: string,
    server: string,
    relative: boolean
  ) => void = processFile
): Promise<void> {
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
        scanFilesWatch(
          res,
          ignoredDirectories,
          server,
          relative,
          fileProcessFunction
        );
      } else {
        fileProcessFunction(res, server, relative ?? false);
      }
    }
  });
}

export async function processFile(
  filePath: string,
  server: string,
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
  if (result.links.length) {
    // check if file already exists in results
    const existingFileIndex = results.findIndex(
      (file) => file.filePath === filePath
    );
    // check if any links are changed and only update the changed links
    const changedLinks = result.links.filter(
      (link) =>
        !results[existingFileIndex]?.links.links.includes(link) ||
        !result.links.includes(link)
    );

    if (changedLinks.length && existingFileIndex > -1) {
      const existingFile = results[existingFileIndex];
      existingFile.links.links = changedLinks;
      results[existingFileIndex] = existingFile;
    }

    for (const link of changedLinks) {
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
    }

    if (result.links.length) {
      results.push({ filePath, linkTestResults, links: result });
      console.log(chalk.blue(`Change in ${filePath}:`));
      for (const link of linkTestResults) {
        if (link.success) {
          console.log(chalk.green(`${link.url} is working`));
        } else {
          console.log(chalk.red(`${link.url} is broken`));
        }
      }
    }
  }
}

// export function watchDirectory(
//     dir: string,
//     ignoredDirectories: string[],
//     server: string,
//     relative?: boolean
//   ) {
//     console.log(`Watching ${dir} for changes...`);
//     function watch(dir: string) {
//       fs.readdir(dir, { withFileTypes: true }, (err, dirents) => {
//         if (err) {
//           console.error(`Error reading directory ${dir}:`, err);
//           return;
//         }

//         dirents.forEach((dirent) => {
//           const fullPath = path.join(dir, dirent.name);

//           const shouldIgnore = ignoredDirectories.some((ignoredDir) =>
//             fullPath.includes(path.normalize(ignoredDir))
//           );

//           if (shouldIgnore) return;

//           if (dirent.isDirectory()) {
//             watch(fullPath);
//           } else {
//             fs.watch(fullPath, (eventType, filename) => {
//               if (filename) {
//                 console.log(`Detected ${eventType} in ${filename}`);
//                 if (eventType === "change") {
//                   scanFilesWatch(fullPath, ignoredDirectories, server, relative);
//                 }
//               }
//             });
//           }
//         });
//       });
//     }

//     watch(dir);
//   }
