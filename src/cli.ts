#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { main } from "./lib/scanFiles";
import { watchDirectory } from "./lib/watchDirectory";

// Setup command line arguments
yargs(hideBin(process.argv))
  .command(
    "scan [directory] [options]",
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

      yargs.option("server", {
        alias: "s",
        describe: "Local dev server url",
        type: "string",
        default: "http://localhost:3000",
      });

      yargs.option("relative", {
        alias: "r",
        describe: "Check relative links",
        type: "boolean",
        default: false,
      });
    },
    (argv) => {
      if (
        typeof argv.directory === "string" &&
        argv.ignore instanceof Array &&
        typeof argv.verbose === "boolean" &&
        typeof argv.relative === "boolean" &&
        typeof argv.server === "string"
      ) {
        main(
          argv.directory,
          argv.ignore,
          argv.server,
          argv.verbose,
          argv.relative
        );
      }
    }
  )
  .command(
    "watch [directory] [options]",
    "Watch the directory for changes and check links",
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

      yargs.option("server", {
        alias: "s",
        describe: "Local dev server url",
        type: "string",
        default: "http://localhost:3000",
      });

      yargs.option("relative", {
        alias: "r",
        describe: "Check relative links",
        type: "boolean",
        default: false,
      });
    },
    (argv) => {
      if (
        typeof argv.directory === "string" &&
        argv.ignore instanceof Array &&
        typeof argv.relative === "boolean" &&
        typeof argv.server === "string"
      ) {
        watchDirectory(argv.directory, argv.ignore, argv.server, argv.relative);
      }
    }
  )
  .demandCommand(1, "You need at least one command before moving on")
  .help()
  .alias("help", "h")
  .parse();
