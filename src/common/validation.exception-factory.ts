import { BadRequestException, ValidationError } from '@nestjs/common';

type ValidationErrorItem = {
  campo: string;
  mensagens: string[];
};

function montarCaminhoCampo(caminhoPai: string, propriedade: string): string {
  if (!caminhoPai) {
    return propriedade;
  }

  return /^\d+$/.test(propriedade)
    ? `${caminhoPai}[${propriedade}]`
    : `${caminhoPai}.${propriedade}`;
}

function traduzirMensagem(campo: string, mensagem: string): string {
  if (mensagem.endsWith('should not exist')) {
    return `O campo "${campo}" não é permitido.`;
  }

  return mensagem;
}

function extrairErrosValidacao(
  erros: ValidationError[],
  caminhoPai = '',
): ValidationErrorItem[] {
  return erros.flatMap((erro) => {
    const campo = montarCaminhoCampo(caminhoPai, erro.property);
    const mensagens = Object.values(erro.constraints ?? {}).map((mensagem) =>
      traduzirMensagem(campo, mensagem),
    );

    const errosFilhos = extrairErrosValidacao(erro.children ?? [], campo);

    return mensagens.length > 0
      ? [{ campo, mensagens }, ...errosFilhos]
      : errosFilhos;
  });
}

export function criarExcecaoValidacao(
  erros: ValidationError[],
): BadRequestException {
  return new BadRequestException({
    message: 'Os dados informados são inválidos.',
    erros: extrairErrosValidacao(erros),
  });
}
