import {
  ApiConfiguration,
  FunctionOptions,
  ImageGenerationModel,
  ImageGenerationModelSettings,
  PromptTemplate,
  PromptTemplateImageGenerationModel,
  zodSchema,
} from "modelfusion";
import {
  AbstractModel,
  callWithRetryAndThrottle,
  createJsonResponseHandler,
  postJsonToApi,
} from "modelfusion/internal";
import { z } from "zod";
import { ExampleApiConfiguration } from "./ExampleApiConfiguration.js";
import { failedExampleCallResponseHandler } from "./ExampleError.js";
import {
  ExampleImageGenerationPrompt,
  mapBasicPromptToExampleFormat,
} from "./ExampleImageGenerationPrompt.js";

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
    const api = this.settings.api ?? new ExampleApiConfiguration();
    const abortSignal = options?.run?.abortSignal;

    return callWithRetryAndThrottle({
      retry: this.settings.api?.retry,
      throttle: this.settings.api?.throttle,
      call: async () =>
        postJsonToApi({
          url: api.assembleUrl(
            `/generation/${this.settings.model}/text-to-image`
          ),
          headers: api.headers,
          body: {
            height: this.settings.height,
            width: this.settings.width,
            text_prompts: input,
            cfg_scale: this.settings.cfgScale,
            clip_guidance_preset: this.settings.clipGuidancePreset,
            sampler: this.settings.sampler,
            samples: this.settings.numberOfGenerations,
            seed: this.settings.seed,
            steps: this.settings.steps,
            style_preset: this.settings.stylePreset,
          },
          failedResponseHandler: failedExampleCallResponseHandler,
          successfulResponseHandler: createJsonResponseHandler(
            zodSchema(stabilityImageGenerationResponseSchema)
          ),
          abortSignal,
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

  async doGenerateImages(
    prompt: ExampleImageGenerationPrompt,
    options?: FunctionOptions
  ) {
    const response = await this.callAPI(prompt, options);

    return {
      response,
      base64Images: response.artifacts.map((artifact) => artifact.base64),
    };
  }

  withTextPrompt() {
    return this.withPromptTemplate(mapBasicPromptToExampleFormat());
  }

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: PromptTemplate<INPUT_PROMPT, ExampleImageGenerationPrompt>
  ): PromptTemplateImageGenerationModel<
    INPUT_PROMPT,
    ExampleImageGenerationPrompt,
    ExampleImageGenerationSettings,
    this
  > {
    return new PromptTemplateImageGenerationModel({
      model: this,
      promptTemplate,
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
