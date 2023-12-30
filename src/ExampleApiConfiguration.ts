import {
  BaseUrlPartsApiConfiguration,
  BaseUrlPartsApiConfigurationOptions,
} from "modelfusion";
import { loadApiKey } from "modelfusion/internal";

export class ExampleApiConfiguration extends BaseUrlPartsApiConfiguration {
  constructor({
    protocol = "https",
    host = "api.stability.ai",
    port = "443",
    path = "/v1",
    apiKey,
    headers,
    retry,
    throttle,
  }: Partial<BaseUrlPartsApiConfigurationOptions> & {
    apiKey?: string;
  } = {}) {
    super({
      protocol,
      host,
      port,
      path,
      headers: headers ?? {
        Authorization: `Bearer ${loadApiKey({
          apiKey,
          environmentVariableName: "STABILITY_API_KEY",
          description: "Stability",
        })}`,
      },
      retry,
      throttle,
    });
  }
}
