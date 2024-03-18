import fs from "fs";

export function getDefaultPort(): number {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

  if (packageJson.dependencies.react) {
    return 3000; // Default for Create React App
  } else if (packageJson.dependencies.vue) {
    return 8080; // Default for Vue CLI
  } else if (packageJson.dependencies.svelte) {
    return 5000; // Common for Svelte apps
  } else if (packageJson.dependencies.astro) {
    return 4321; // Common for Astro apps
  } else if (packageJson.dependencies.vite) {
    return 5173; // Default for Vite
  }

  return 3000;
}
