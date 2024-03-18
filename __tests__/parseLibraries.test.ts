import {
  parseAstroFile,
  parseJSXorTSXFile,
  parseSvelteFile,
  parseVueFile,
} from "../src/lib/parsing";
import fs from "fs";

jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  readFileSync: jest.fn(),
}));

const readFileSyncMock = fs.readFileSync as jest.Mock;

const server = "http://localhost:3000";
const relative = false;

describe("parse library content", () => {
  it("extracts links correctly from JSX/TSX content", () => {
    const jsxContent = `
      import React from 'react';
      const TestComponent = () => (
        <a href="https://react-example.com">React Example</a>
      );
      export default TestComponent;
    `;

    readFileSyncMock.mockReturnValue(jsxContent);

    const links = parseJSXorTSXFile("/path/to/file.tsx", server, relative);
    expect(links).toEqual({
      fileName: "file.tsx",
      links: ["https://react-example.com"],
    });
  });

  describe("parseVueFile", () => {
    it("extracts links correctly from Vue file content", () => {
      const vueContent = `
        <template>
          <a href="https://vue-example.com">Vue Example</a>
        </template>
      `;

      readFileSyncMock.mockReturnValue(vueContent);

      const links = parseVueFile("/path/to/file.vue", server, relative);
      expect(links).toEqual({
        fileName: "file.vue",
        links: ["https://vue-example.com"],
      });
    });
  });

  describe("parseSvelteFile", () => {
    it("extracts links correctly from Svelte file content", () => {
      const svelteContent = `
        <script>
          let name = 'Svelte';
        </script>
        <a href="https://svelte-example.com">Svelte Example</a>
      `;

      readFileSyncMock.mockReturnValue(svelteContent);

      const links = parseSvelteFile("/path/to/file.svelte", server, relative);
      expect(links).toEqual({
        fileName: "file.svelte",
        links: ["https://svelte-example.com"],
      });
    });
  });

  describe("parseAstroFile", () => {
    it("extracts links correctly from Astro file content", () => {
      const astroContent = `
        ---
        const title = "Astro";
        ---
        <a href="https://astro-example.com">Astro Example</a>
      `;

      // Simulating the reading of an Astro file, skipping the front matter
      readFileSyncMock.mockReturnValue(astroContent);

      const links = parseAstroFile("/path/to/file.astro", server, relative);
      expect(links).toEqual({
        fileName: "file.astro",
        links: ["https://astro-example.com"],
      });
    });
  });
});
