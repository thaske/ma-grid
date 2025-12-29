import { execSync } from "node:child_process";

export default async function globalSetup() {
  execSync("wxt build --mode test", { stdio: "inherit" });
}
