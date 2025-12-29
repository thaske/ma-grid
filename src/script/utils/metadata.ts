/**
 * Userscript metadata header generator
 * Generates the ==UserScript== header block for Greasemonkey/Tampermonkey
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

interface PackageJson {
  name: string;
  version: string;
  description: string;
  author?: string;
  repository?: {
    type: string;
    url: string;
  };
}

/**
 * Generate userscript metadata headers
 * @param updateURL - Optional URL for auto-updates
 * @param downloadURL - Optional URL for downloads
 */
export function generateMetadata(
  updateURL?: string,
  downloadURL?: string
): string {
  const packageJsonPath = join(process.cwd(), "package.json");
  const packageJson: PackageJson = JSON.parse(
    readFileSync(packageJsonPath, "utf-8")
  );

  const repoUrl =
    packageJson.repository?.url.replace(/\.git$/, "") ||
    "https://github.com/thaske/ma-grid";
  const namespace = repoUrl.replace("https://", "").replace("http://", "");

  const iconPath = join(process.cwd(), "public/icons/icon16.png");
  let iconData = "";
  try {
    const iconBuffer = readFileSync(iconPath);
    iconData = `data:image/png;base64,${iconBuffer.toString("base64")}`;
  } catch (error) {
    console.warn("[MA-Grid] Could not read icon file:", error);
  }

  const metadata = `// ==UserScript==
// @name         MA Grid
// @namespace    ${namespace}
// @version      ${packageJson.version}
// @description  ${packageJson.description}
// @author       ${packageJson.author}
// @match        https://mathacademy.com/learn
// @match        https://www.mathacademy.com/learn
${iconData ? `// @icon         ${iconData}` : ""}
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @connect      mathacademy.com
// @connect      www.mathacademy.com
// @run-at       document-end
${updateURL ? `// @updateURL    ${updateURL}` : ""}
${downloadURL ? `// @downloadURL  ${downloadURL}` : ""}
// ==/UserScript==

`;

  return metadata;
}
