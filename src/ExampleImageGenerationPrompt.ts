import { PromptTemplate } from "modelfusion";

export type ExampleImageGenerationPrompt = Array<{
  text: string;
  weight?: number;
}>;

/**
 * Formats a basic text prompt as a Stability prompt.
 */
export function mapBasicPromptToExampleFormat(): PromptTemplate<
  string,
  ExampleImageGenerationPrompt
> {
  return {
    format: (description) => [{ text: description }],
  };
}
