import axios, { isAxiosError } from "axios";

/**
 * Checks if a link is working by making a HEAD request.
 *
 * @param url The URL to check.
 * @returns A promise that resolves to an object with the URL and a boolean indicating if the link is working.
 */
export async function isLinkWorking(
  url: string
): Promise<{ success: boolean; url: string; error?: string }> {
  try {
    await axios.head(url, {
      timeout: 5000,
    });
    return { success: true, url };
  } catch (error: any) {
    if (isAxiosError(error))
      console.error(`Error checking link ${url}:`, error.message);
    return { success: false, url, error: error.message };
  }
}
