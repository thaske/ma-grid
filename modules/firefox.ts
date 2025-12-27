import { defineWxtModule } from "wxt/modules";

export default defineWxtModule((wxt) => {
  wxt.hooks.hook("build:manifestGenerated", (ctx, manifest) => {
    if (ctx.config.env.browser !== "firefox") return;

    if (!manifest.browser_specific_settings) {
      manifest.browser_specific_settings = {};
    }
    if (!manifest.browser_specific_settings.gecko) {
      manifest.browser_specific_settings.gecko = {};
    }

    manifest.browser_specific_settings.gecko.data_collection_permissions = {
      required: ["none"],
      optional: [],
    };

    const geckoId = process.env.WXT_GECKO_ID;
    if (geckoId) {
      manifest.browser_specific_settings.gecko.id = geckoId;
    }

    if (
      manifest.web_accessible_resources &&
      Array.isArray(manifest.web_accessible_resources)
    ) {
      manifest.web_accessible_resources = manifest.web_accessible_resources.map(
        (resource: any) => {
          if (
            typeof resource === "object" &&
            resource !== null &&
            "use_dynamic_url" in resource
          ) {
            const { use_dynamic_url, ...rest } = resource;
            return rest;
          }
          return resource;
        }
      );
    }
  });
});
