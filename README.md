# Link Sweeper 🧹

[![npm version](https://img.shields.io/npm/v/link-sweeper.svg)](https://www.npmjs.com/package/link-sweeper)
[![npm downloads](https://img.shields.io/npm/dt/link-sweeper.svg)](https://www.npmjs.com/package/link-sweeper)

**Link Sweeper** is a simple command-line tool designed to keep your web application's links fresh and functional. Tailored for modern web projects, it supports a variety of frameworks such as React, Vue, Svelte, and more, ensuring your project stays link-error-free.

## Features

- **Comprehensive Scanning**: Traverses your project files (HTML, JSX, TSX, Vue, Svelte, Astro) to detect links.
- **Robust Link Verification**: Validates each discovered link for accessibility, flagging any issues with unreachable URLs.
- **Customizable Exclusions**: Allows specification of directories to ignore (e.g., `node_modules`, `.git`) during the scan.
- **Detailed Reporting**: Offers verbose logging for insights into the scanning process and link verification results.

## Installation

Install Link Sweeper globally for system-wide access:

    npm install -g link-sweeper

Or, add it to your project as a development dependency:

    npm install link-sweeper --save-dev

## Usage

### Scan

Run Link Sweeper in your project directory to scan for links:
Be sure to use npx/pnpm/...etc when running globally.

    link-sweeper scan ./src

Exclude specific directories from the scan:

    link-sweeper scan ./src --i node_modules,.git

To check relative links against a development server:

    link-sweeper scan ./src --s http://localhost:3000 --r

Ensure your development server is running when using the `--s` flag. If a server URL is not provided, Link Sweeper attempts to infer the default development server from your project's `package.json`.

### Watch

Run Link Sweeper in watch mode to continuously monitor your project for link changes:

    link-sweeper watch ./src

Exclude specific directories from the watch:

    link-sweeper watch ./src --i node_modules,.git

To check relative links against a development server:

    link-sweeper watch ./src --s http://localhost:3000 --r

Ensure your development server is running when using the `--s` flag. If a server URL is not provided, Link Sweeper attempts to infer the default development server from your project's `package.json`.

For integration into your project or to utilize Link Sweeper's utilities directly:

    npm install link-sweeper --save

Happy Sweeping! 🚀

## Contributing

Contributions are welcome! Please refer to the [Contributing Guidelines](CONTRIBUTING.md) for more information.
