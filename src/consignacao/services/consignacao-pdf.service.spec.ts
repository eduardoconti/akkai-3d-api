import { StatusConsignacao, StatusRevendedor } from '@consignacao/entities';
import { DetalheConsignacaoDto } from '@consignacao/dto';
import { ConsignacaoPdfService } from './consignacao-pdf.service';

describe('ConsignacaoPdfService', () => {
  let service: ConsignacaoPdfService;

  beforeEach(() => {
    service = new ConsignacaoPdfService();
  });

  it('deve gerar PDF da consignação sem telefone do revendedor', () => {
    const relatorio = service.gerarRelatorio(criarConsignacao());
    const conteudo = relatorio.buffer.toString('latin1');

    expect(relatorio.nomeArquivo).toBe('consignacao-12.pdf');
    expect(conteudo.startsWith('%PDF-1.4')).toBe(true);
    expect(conteudo).toContain('Loja Centro 3D');
    expect(conteudo).not.toContain('(11) 99999-9999');
  });
});

function criarConsignacao(): DetalheConsignacaoDto {
  return {
    id: 12,
    revendedor: {
      id: 3,
      nome: 'Loja Centro 3D',
      telefone: '(11) 99999-9999',
      status: StatusRevendedor.ATIVO,
      percentualDesconto: 20,
    },
    status: StatusConsignacao.ABERTA,
    dataInclusao: new Date('2026-01-01T12:00:00.000Z'),
    percentualDesconto: 20,
    quantidadeEnviada: 2,
    quantidadeVendida: 0,
    quantidadeDevolvida: 0,
    quantidadeDisponivel: 2,
    itens: [
      {
        id: 1,
        idProduto: 10,
        nomeProduto: 'Dragão articulado',
        codigoProduto: 4001,
        quantidadeEnviada: 2,
        quantidadeVendida: 0,
        quantidadeDevolvida: 0,
        quantidadeDisponivel: 2,
        valorUnitario: 2500,
      },
    ],
  };
}
