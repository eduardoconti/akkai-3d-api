import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidationErrorItemDto {
  @ApiProperty({
    example: 'nome',
    description: 'Campo do payload que causou o erro de validação.',
  })
  campo!: string;

  @ApiProperty({
    type: [String],
    example: ['O nome do produto é obrigatório.'],
    description: 'Mensagens de erro associadas ao campo.',
  })
  mensagens!: string[];
}

export class ProblemDetailsDto {
  @ApiProperty({
    example: 'https://httpstatuses.com/400',
    description: 'URI que identifica o tipo do problema.',
  })
  type!: string;

  @ApiProperty({
    example: 'Bad Request',
    description: 'Título resumido do problema.',
  })
  title!: string;

  @ApiProperty({
    example: 400,
    description: 'Status HTTP da resposta.',
  })
  status!: number;

  @ApiProperty({
    example: 'Os dados informados são inválidos.',
    description: 'Descrição humana do erro.',
  })
  detail!: string;

  @ApiProperty({
    example: '/produto',
    description: 'Endpoint da requisição que originou o problema.',
  })
  instance!: string;

  @ApiPropertyOptional({
    type: [ValidationErrorItemDto],
    description:
      'Lista de erros por campo quando o problema é causado por validação.',
  })
  errors?: ValidationErrorItemDto[];
}
