import { ApiCallError, parseJSON, zodSchema } from "modelfusion";
import { ResponseHandler } from "modelfusion/extension";
import { z } from "zod";

export const exampleErrorDataSchema = zodSchema(
  z.object({
    message: z.string(),
  })
);

export type ExampleErrorData = (typeof exampleErrorDataSchema)["_type"];

export class ExampleError extends ApiCallError {
  public readonly data: ExampleErrorData;

  constructor({
    data,
    statusCode,
    url,
    requestBodyValues,
    message = data.message,
  }: {
    message?: string;
    statusCode: number;
    url: string;
    requestBodyValues: unknown;
    data: ExampleErrorData;
  }) {
    super({ message, statusCode, requestBodyValues, url });

    this.data = data;
  }
}

export const failedExampleCallResponseHandler: ResponseHandler<
  ApiCallError
> = async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  const parsedError = parseJSON({
    text: responseBody,
    schema: exampleErrorDataSchema,
  });

  return new ExampleError({
    url,
    requestBodyValues,
    statusCode: response.status,
    data: parsedError,
  });
};
