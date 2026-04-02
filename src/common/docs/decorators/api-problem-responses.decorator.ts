import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiResponse,
  getSchemaPath,
  type ApiResponseOptions,
} from '@nestjs/swagger';
import { ProblemDetailsDto } from '../dto/problem-details.dto';

export type ProblemResponseConfig = {
  status: HttpStatus;
  description: string;
  example: Record<string, unknown>;
};

export function ApiProblemResponses(
  ...responses: ProblemResponseConfig[]
): MethodDecorator & ClassDecorator {
  return applyDecorators(
    ApiExtraModels(ProblemDetailsDto),
    ...responses.map((response) =>
      ApiResponse({
        status: response.status,
        description: response.description,
        content: {
          'application/problem+json': {
            schema: {
              allOf: [{ $ref: getSchemaPath(ProblemDetailsDto) }],
              example: response.example,
            },
          },
        },
      } as ApiResponseOptions),
    ),
  );
}
