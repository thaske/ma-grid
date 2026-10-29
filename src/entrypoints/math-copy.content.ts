import { defineContentScript } from "wxt/utils/define-content-script";
import { mountMathCopy } from "@/utils/mathCopy";

export default defineContentScript({
  matches: [
    "https://www.mathacademy.com/tasks/*",
    "https://mathacademy.com/tasks/*",
  ],
  world: "MAIN",
  main() {
    mountMathCopy();
  },
});
