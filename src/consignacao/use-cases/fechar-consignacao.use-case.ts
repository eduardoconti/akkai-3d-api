import { BadRequestException, Injectable } from '@nestjs/common';
import { ContextoUsuario } from '@common/contracts';
import { DetalheConsignacaoDto, FecharConsignacaoDto } from '@consignacao/dto';
import {
  FechamentoConsignacao,
  PagamentoFechamentoConsignacao,
} from '@consignacao/contracts';
import { ConsultaCarteira, ConsultaTaxaPagamento } from '@financeiro/contracts';

@Injectable()
export class FecharConsignacaoUseCase {
  constructor(
    private readonly fechamentoConsignacao: FechamentoConsignacao,
    private readonly consultaCarteira: ConsultaCarteira,
    private readonly consultaTaxaPagamento: ConsultaTaxaPagamento,
    private readonly contextoUsuario: ContextoUsuario,
  ) {}

  async execute(
    idConsignacao: number,
    input: FecharConsignacaoDto,
  ): Promise<DetalheConsignacaoDto> {
    const temVenda = input.itens.some((item) => item.quantidadeVendida > 0);
    let pagamento: PagamentoFechamentoConsignacao | undefined;

    if (temVenda) {
      if (!input.idCarteira || !input.meioPagamento) {
        throw new BadRequestException(
          'Informe a carteira e o meio de pagamento para fechar a consignação com vendas.',
        );
      }

      const carteira =
        await this.consultaCarteira.garantirCarteiraAceitaMeioPagamento(
          input.idCarteira,
          input.meioPagamento,
        );
      const taxa =
        await this.consultaTaxaPagamento.obterTaxaAtivaPorCarteiraEMeioPagamento(
          input.idCarteira,
          input.meioPagamento,
        );

      pagamento = {
        idCarteira: input.idCarteira,
        meioPagamento: input.meioPagamento,
        percentualTaxa: taxa?.percentual ?? null,
        percentualImposto: carteira.consideraImpostoVenda
          ? (carteira.percentualImpostoVenda ?? null)
          : null,
      };
    }

    return this.fechamentoConsignacao.fecharConsignacao(
      idConsignacao,
      input.itens,
      pagamento,
      this.contextoUsuario.usuarioId,
    );
  }
}
