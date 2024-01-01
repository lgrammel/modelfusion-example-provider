import { ApiCallError, zodSchema } from "modelfusion";
import {
  ResponseHandler,
  createJsonErrorResponseHandler,
} from "modelfusion/internal";
import { z } from "zod";

export const exampleErrorDataSchema = z.object({
  message: z.string(),
});

export type ExampleErrorData = z.infer<typeof exampleErrorDataSchema>;

export const failedExampleCallResponseHandler: ResponseHandler<ApiCallError> =
  createJsonErrorResponseHandler({
    errorSchema: zodSchema(exampleErrorDataSchema),
    errorToMessage: (error) => error.message,
  });
