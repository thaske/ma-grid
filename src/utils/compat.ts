import { ContentScriptContext } from "wxt/utils/content-script-context";

export function safariFix(ctx: ContentScriptContext) {
  // To prevent multiple injections of the content script in Safari, ensure the script runs only in the main frame.
  // This can be achieved by checking if `window.top === window` before executing the script logic.
  // https://stackoverflow.com/a/56891145
  if (window.top !== window) return;
  if (document.documentElement?.dataset.maGridContentScriptLoaded) return;
  document.documentElement.dataset.maGridContentScriptLoaded = "true";
  ctx.onInvalidated(() => {
    if (document.documentElement?.dataset.maGridContentScriptLoaded) {
      delete document.documentElement.dataset.maGridContentScriptLoaded;
    }
  });
}
