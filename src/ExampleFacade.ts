import {
  ExampleImageGenerationModel,
  ExampleImageGenerationSettings,
} from "./ExampleImageGenerationModel.js";

/**
 * Create an image generation model that calls the Stability AI image generation API.
 *
 * @see https://api.stability.ai/docs#tag/v1generation/operation/textToImage
 *
 * @example
 * const image = await generateImage(
 *   stability.ImageGenerator({
 *     model: "stable-diffusion-512-v2-1",
 *     cfgScale: 7,
 *     clipGuidancePreset: "FAST_BLUE",
 *     height: 512,
 *     width: 512,
 *     samples: 1,
 *     steps: 30,
 *   })
 *   [
 *     { text: "the wicked witch of the west" },
 *     { text: "style of early 19th century painting", weight: 0.5 },
 *   ]
 * );
 *
 * @returns A new instance of {@link ExampleImageGenerationModel}.
 */
export function ImageGenerator(settings: ExampleImageGenerationSettings) {
  return new ExampleImageGenerationModel(settings);
}
