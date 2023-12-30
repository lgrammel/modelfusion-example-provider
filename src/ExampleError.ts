import { ApiCallError, zodSchema } from "modelfusion";
import {
  ResponseHandler,
  createJsonErrorResponseHandler,
} from "modelfusion/internal";
import { z } from "zod";

export const exampleErrorDataSchema = zodSchema(
  z.object({
    message: z.string(),
  })
);

export type ExampleErrorData = (typeof exampleErrorDataSchema)["_type"];

export const failedExampleCallResponseHandler: ResponseHandler<ApiCallError> =
  createJsonErrorResponseHandler({
    errorSchema: exampleErrorDataSchema,
    errorToMessage: (error) => error.message,
  });
