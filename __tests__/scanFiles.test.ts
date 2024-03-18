import { scanFiles } from "../src/lib/scanFiles";
import fs from "fs";
import path from "path";

jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  readdir: jest.fn(),
}));

jest.mock("path", () => ({
  ...jest.requireActual("path"), // Use actual implementations from 'path' except for what you mock
  resolve: jest.fn(),
}));

describe("scanFiles", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (fs.readdir as jest.MockedFunction<typeof fs.readdir>).mockImplementation(
      (dir, options, callback) => {
        if (typeof options === "function") {
          callback = options;
        }

        let items: fs.Dirent[] = [];
        if (dir === "/test") {
          items = [
            {
              name: "file1.html",
              isDirectory: () => false,
              isFile: () => true,
              isBlockDevice: () => false,
              isCharacterDevice: () => false,
              isSymbolicLink: () => false,
              isFIFO: () => false,
              isSocket: () => false,
              path: "/test/file1.html",
            },
            {
              name: "subdirectory",
              isDirectory: () => true,
              isFile: () => false,
              isBlockDevice: () => false,
              isCharacterDevice: () => false,
              isSymbolicLink: () => false,
              isFIFO: () => false,
              isSocket: () => false,
              path: "/test/subdirectory",
            },
          ];
        } else if (dir === "/test/subdirectory") {
          items = [
            {
              name: "file2.txt",
              isDirectory: () => false,
              isFile: () => true,
              isBlockDevice: () => false,
              isCharacterDevice: () => false,
              isSymbolicLink: () => false,
              isFIFO: () => false,
              isSocket: () => false,
              path: "/test/subdirectory/file2.txt",
            },
          ];
        }

        process.nextTick(() => callback(null, items));
      }
    );

    (path.resolve as jest.Mock).mockImplementation((...args) => args.join("/"));
  });

  it("scans directories and files correctly", (done) => {
    const ignoredDirectories: string[] = [];
    const verbose = false;
    const server = "http://localhost:3000";
    const relative = false;
    const processFileMock = jest.fn(() => {
      if (processFileMock.mock.calls.length === 1) {
        expect(processFileMock).toHaveBeenCalledWith(
          expect.stringContaining("file1.html"),
          expect.stringContaining(server),
          expect.any(Boolean),
          expect.any(Boolean)
        );

        done();
      }
    });

    scanFiles(
      "/test",
      ignoredDirectories,
      server,
      verbose,
      relative,
      processFileMock
    );
  });

  it("ignores specified directories", (done) => {
    const ignoredDirectories = ["/test/subdirectory"];
    const verbose = false;
    const server = "http://localhost:3000";
    const relative = false;
    const processFileMock = jest.fn();

    scanFiles(
      "/test",
      ignoredDirectories,
      server,
      verbose,
      relative,
      processFileMock
    );

    process.nextTick(() => {
      expect(processFileMock).toHaveBeenCalledTimes(1);
      expect(processFileMock).toHaveBeenCalledWith(
        expect.stringContaining("file1.html"),
        expect.stringContaining(server),
        expect.any(Boolean),
        expect.any(Boolean)
      );
      expect(processFileMock).not.toHaveBeenCalledWith(
        expect.stringContaining("file2.txt"),
        expect.stringContaining(server),
        expect.any(Boolean),
        expect.any(Boolean)
      );
      done();
    });
  });
});
