#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { scanFiles } from "./lib/scanFiles";

// Setup command line arguments
yargs(hideBin(process.argv))
  .command(
    "scan <directory>",
    "Scan the directory for files and check links",
    (yargs) => {
      yargs.positional("directory", {
        describe: "The directory to scan",
        type: "string",
        default: process.cwd(),
      });

      yargs.option("ignore", {
        alias: "i",
        describe: "Ignore directories",
        type: "array",
        default: ["node_modules", ".git", "dist"],
      });

      yargs.option("verbose", {
        alias: "v",
        describe: "Log the results of each file",
        type: "boolean",
        default: false,
      });
    },
    (argv) => {
      if (typeof argv.directory === "string" && argv.ignore instanceof Array) {
        // console.log(`Scanning directory: ${argv.directory}`);
        scanFiles(argv.directory, argv.ignore);
      }
    }
  )
  .demandCommand(1, "You need at least one command before moving on")
  .help()
  .alias("help", "h")
  .parse();
