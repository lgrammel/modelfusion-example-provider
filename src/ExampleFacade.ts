import { ExampleApiConfiguration } from "ExampleApiConfiguration.js";
import { BaseUrlPartsApiConfigurationOptions } from "modelfusion";
import {
  ExampleImageGenerationModel,
  ExampleImageGenerationSettings,
} from "./ExampleImageGenerationModel.js";

export function Api(
  settings: Partial<BaseUrlPartsApiConfigurationOptions> & {
    apiKey?: string;
  }
) {
  return new ExampleApiConfiguration(settings);
}

export function ImageGenerator(settings: ExampleImageGenerationSettings) {
  return new ExampleImageGenerationModel(settings);
}
