import {
  BaseUrlApiConfiguration,
  RetryFunction,
  ThrottleFunction,
} from "modelfusion";
import { loadApiKey } from "modelfusion/extension";

export class ExampleApiConfiguration extends BaseUrlApiConfiguration {
  constructor({
    baseUrl = "https://api.stability.ai/v1",
    apiKey,
    retry,
    throttle,
  }: {
    baseUrl?: string;
    apiKey?: string;
    retry?: RetryFunction;
    throttle?: ThrottleFunction;
  } = {}) {
    super({
      baseUrl,
      headers: {
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
