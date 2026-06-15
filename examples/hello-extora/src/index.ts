import { BasePlugin } from "@extora/sdk";
import type { PluginManifest } from "@extora/types";

const manifest: PluginManifest = {
  name: "hello-extora",
  version: "0.0.0",
  type: "plugin",
  title: "Hello Extora",
  author: { name: "Developer" },
  license: "UNLICENSED",
  extora: { core: ">=1.0.0 <2.0.0" },
  permissions: [],
  entry: { server: "dist/index.js" },
};

export default class HelloExtora extends BasePlugin {
  override manifest = manifest;

  override async onActivate(): Promise<void> {
    this.logger.info("Hello Extora activated");
  }

  override async onDeactivate(): Promise<void> {
    this.logger.info("Hello Extora deactivated");
  }
}
