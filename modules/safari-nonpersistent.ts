import { defineWxtModule } from "wxt/modules";

export default defineWxtModule((wxt) => {
  wxt.hooks.hook("build:manifestGenerated", (ctx, manifest) => {
    if (ctx.config.env.browser !== "safari") return;
    if (manifest.manifest_version !== 2) return;

    if (!manifest.background || Array.isArray(manifest.background)) return;
    manifest.background.persistent = false;
  });
});
