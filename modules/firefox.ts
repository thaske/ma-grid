import { defineWxtModule } from "wxt/modules";

export default defineWxtModule((wxt) => {
  wxt.hooks.hook("build:manifestGenerated", (ctx, manifest) => {
    if (ctx.config.env.browser !== "firefox") return;

    // Initialize browser_specific_settings if needed
    if (!manifest.browser_specific_settings) {
      manifest.browser_specific_settings = {};
    }
    if (!manifest.browser_specific_settings.gecko) {
      manifest.browser_specific_settings.gecko = {};
    }

    // Set data collection permissions
    manifest.browser_specific_settings.gecko.data_collection_permissions = {
      required: ["none"],
      optional: [],
    };

    // Set gecko ID from environment variable if provided
    const geckoId = process.env.WXT_GECKO_ID;
    if (geckoId) {
      manifest.browser_specific_settings.gecko.id = geckoId;
    }
  });
});
