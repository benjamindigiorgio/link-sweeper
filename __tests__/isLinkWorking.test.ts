// In your isLinkWorking.test.ts
jest.mock("axios");

import axios from "axios";
import { isLinkWorking } from "../src/lib/linkChecker";
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("isLinkWorking", () => {
  it("correctly identifies a working link", async () => {
    mockedAxios.head.mockResolvedValue({ status: 200 });

    const link = "https://example.com";

    await expect(isLinkWorking(link)).resolves.toEqual({
      success: true,
      url: "https://example.com",
    });

    mockedAxios.head.mockReset();
  });
});
