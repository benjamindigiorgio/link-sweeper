# Link Sweeper

[![npm](https://img.shields.io/npm/v/link-sweeper)](https://www.npmjs.com/package/link-sweeper)
[![npm](https://img.shields.io/npm/dt/link-sweeper)](https://www.npmjs.com/package/link-sweeper)

Link Sweeper is a command-line tool designed to scan your web application projects for links, verifying their validity to ensure you have no dead links. It's built with the modern web in mind, supporting projects using frameworks like React, Vue, Svelte, and more.

Currently it only checks for href values which include http but in the future I will work on adding support for relative paths and other types of links (i.e. `to` in Nuxt).

## Features

- **Directory Scanning**: Recursively scan specified directories for HTML, JSX, TSX, Vue, Svelte, and Astro files to find links.
- **Link Validation**: Check each found link to determine if it's valid (reachable).
- **Custom Ignored Directories**: Exclude specific directories from scanning, such as `node_modules`, `.git`, or any custom folders.
- **Verbose Logging**: Option to log detailed results for each file scanned, providing insight into the link checking process.

## Installation

You can install Link Sweeper globally using npm:

```bash
npm install -g link-sweeper
```

or locally to your project:

```bash
npm install link-sweeper --save-dev
```

## Usage

To use Link Sweeper, simply run the command with the directories you want to scan:

```bash
link-sweeper scan ./src
```

You can also specify which directories to ignore:

```bash
link-sweeper scan ./src --i node_modules,.git
```

If you want to use any of the utilities provided by this library they are all available but make sure to install it as a dependency instead of a dev dependency.

```bash
npm install link-sweeper --save
```
