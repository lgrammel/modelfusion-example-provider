import {
  BaseUrlApiConfigurationWithDefaults,
  PartialBaseUrlPartsApiConfigurationOptions,
} from "modelfusion";
import { loadApiKey } from "modelfusion/internal";

export class ExampleApiConfiguration extends BaseUrlApiConfigurationWithDefaults {
  constructor(
    settings: PartialBaseUrlPartsApiConfigurationOptions & {
      apiKey?: string;
    } = {}
  ) {
    super({
      ...settings,
      headers: settings.headers ?? {
        Authorization: `Bearer ${loadApiKey({
          apiKey: settings.apiKey,
          environmentVariableName: "STABILITY_API_KEY",
          description: "Stability",
        })}`,
      },
      baseUrlDefaults: {
        protocol: "https",
        host: "api.stability.ai",
        port: "443",
        path: "/v1",
      },
    });
  }
}
