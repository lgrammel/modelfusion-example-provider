import {
  ApiConfiguration,
  FunctionOptions,
  ImageGenerationModel,
  ImageGenerationModelSettings,
  PromptFormat,
  PromptFormatImageGenerationModel,
} from "modelfusion";
import {
  AbstractModel,
  callWithRetryAndThrottle,
  createJsonResponseHandler,
  postJsonToApi,
} from "modelfusion/extension";
import { z } from "zod";
import { failedExampleCallResponseHandler } from "./ExampleError.js";
import {
  ExampleImageGenerationPrompt as ExampleImageGenerationPrompt,
  mapBasicPromptToExampleFormat,
} from "./ExampleImageGenerationPrompt.js";
import { ExampleApiConfiguration } from "./ExampleApiConfiguration.js";

/**
 * Create an image generation model that calls the Stability AI image generation API.
 *
 * @see https://api.stability.ai/docs#tag/v1generation/operation/textToImage
 *
 * @example
 * const image = await generateImage(
 *   new StabilityImageGenerationModel({
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
 */
export class ExampleImageGenerationModel
  extends AbstractModel<ExampleImageGenerationSettings>
  implements
    ImageGenerationModel<
      ExampleImageGenerationPrompt,
      ExampleImageGenerationSettings
    >
{
  constructor(settings: ExampleImageGenerationSettings) {
    super({ settings });
  }

  readonly provider = "stability" as const;

  get modelName() {
    return this.settings.model;
  }

  async callAPI(
    input: ExampleImageGenerationPrompt,
    options?: FunctionOptions
  ): Promise<StabilityImageGenerationResponse> {
    return callWithRetryAndThrottle({
      retry: this.settings.api?.retry,
      throttle: this.settings.api?.throttle,
      call: async () =>
        callExampleImageGenerationAPI({
          ...this.settings,
          abortSignal: options?.run?.abortSignal,
          engineId: this.settings.model,
          textPrompts: input,
        }),
    });
  }

  get settingsForEvent(): Partial<ExampleImageGenerationSettings> {
    const eventSettingProperties = [
      "baseUrl",
      "height",
      "width",
      "cfgScale",
      "clipGuidancePreset",
      "sampler",
      "samples",
      "seed",
      "steps",
      "stylePreset",
    ];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  async doGenerateImage(
    prompt: ExampleImageGenerationPrompt,
    options?: FunctionOptions
  ) {
    const response = await this.callAPI(prompt, options);

    return {
      response,
      base64Image: response.artifacts[0].base64,
    };
  }

  withTextPrompt() {
    return this.withPromptFormat(mapBasicPromptToExampleFormat());
  }

  withPromptFormat<INPUT_PROMPT>(
    promptFormat: PromptFormat<INPUT_PROMPT, ExampleImageGenerationPrompt>
  ): PromptFormatImageGenerationModel<
    INPUT_PROMPT,
    ExampleImageGenerationPrompt,
    ExampleImageGenerationSettings,
    this
  > {
    return new PromptFormatImageGenerationModel({
      model: this,
      promptFormat,
    });
  }

  withSettings(additionalSettings: ExampleImageGenerationSettings) {
    return new ExampleImageGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const stabilityImageGenerationModels = [
  "stable-diffusion-v1-5",
  "stable-diffusion-512-v2-1",
  "stable-diffusion-xl-1024-v0-9",
  "stable-diffusion-xl-1024-v1-0",
] as const;

export type ExampleImageGenerationModelType =
  | (typeof stabilityImageGenerationModels)[number]
  // string & {} is used to enable auto-completion of literals
  // while also allowing strings:
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {});

export interface ExampleImageGenerationSettings
  extends ImageGenerationModelSettings {
  api?: ApiConfiguration;

  model: ExampleImageGenerationModelType;

  height?: number;
  width?: number;
  cfgScale?: number;
  clipGuidancePreset?: string;
  sampler?: StabilityImageGenerationSampler;
  samples?: number;
  seed?: number;
  steps?: number;
  stylePreset?: StabilityImageGenerationStylePreset;
}

const stabilityImageGenerationResponseSchema = z.object({
  artifacts: z.array(
    z.object({
      base64: z.string(),
      seed: z.number(),
      finishReason: z.enum(["SUCCESS", "ERROR", "CONTENT_FILTERED"]),
    })
  ),
});

export type StabilityImageGenerationResponse = z.infer<
  typeof stabilityImageGenerationResponseSchema
>;

export type StabilityImageGenerationStylePreset =
  | "enhance"
  | "anime"
  | "photographic"
  | "digital-art"
  | "comic-book"
  | "fantasy-art"
  | "line-art"
  | "analog-film"
  | "neon-punk"
  | "isometric"
  | "low-poly"
  | "origami"
  | "modeling-compound"
  | "cinematic"
  | "3d-model"
  | "pixel-art"
  | "tile-texture";

export type StabilityImageGenerationSampler =
  | "DDIM"
  | "DDPM"
  | "K_DPMPP_2M"
  | "K_DPMPP_2S_ANCESTRAL"
  | "K_DPM_2"
  | "K_DPM_2_ANCESTRAL"
  | "K_EULER"
  | "K_EULER_ANCESTRAL"
  | "K_HEUN"
  | "K_LMS";

async function callExampleImageGenerationAPI({
  api = new ExampleApiConfiguration(),
  abortSignal,
  engineId,
  height,
  width,
  textPrompts,
  cfgScale,
  clipGuidancePreset,
  sampler,
  samples,
  seed,
  steps,
  stylePreset,
}: {
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
  engineId: string;
  height?: number;
  width?: number;
  textPrompts: ExampleImageGenerationPrompt;
  cfgScale?: number;
  clipGuidancePreset?: string;
  sampler?: StabilityImageGenerationSampler;
  samples?: number;
  seed?: number;
  steps?: number;
  stylePreset?: StabilityImageGenerationStylePreset;
}): Promise<StabilityImageGenerationResponse> {
  return postJsonToApi({
    url: api.assembleUrl(`/generation/${engineId}/text-to-image`),
    headers: api.headers,
    body: {
      height,
      width,
      text_prompts: textPrompts,
      cfg_scale: cfgScale,
      clip_guidance_preset: clipGuidancePreset,
      sampler,
      samples,
      seed,
      steps,
      style_preset: stylePreset,
    },
    failedResponseHandler: failedExampleCallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      stabilityImageGenerationResponseSchema
    ),
    abortSignal,
  });
}
