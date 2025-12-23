import { defineWxtModule } from "wxt/modules";

export default defineWxtModule((wxt) => {
  wxt.hooks.hook("build:manifestGenerated", (ctx, manifest) => {
    if (ctx.config.env.browser !== "firefox") return;

    const geckoId = process.env.WXT_GECKO_ID;
    if (!geckoId) return;

    if (!manifest.browser_specific_settings) {
      manifest.browser_specific_settings = {};
    }
    if (!manifest.browser_specific_settings.gecko) {
      manifest.browser_specific_settings.gecko = {};
    }

    manifest.browser_specific_settings.gecko.id = geckoId;
  });
});
