import { Injectable } from '@nestjs/common';
import { DetalheConsignacaoDto, ItemConsignacaoDto } from '@consignacao/dto';

type PaginaPdf = string[];

type ObjetoPdf = {
  id: number;
  conteudo: string;
};

export type RelatorioConsignacaoPdf = {
  nomeArquivo: string;
  buffer: Buffer;
};

@Injectable()
export class ConsignacaoPdfService {
  gerarRelatorio(consignacao: DetalheConsignacaoDto): RelatorioConsignacaoPdf {
    const paginas = this.criarPaginas(consignacao);
    const buffer = this.montarPdf(paginas);

    return {
      nomeArquivo: `consignacao-${consignacao.id}.pdf`,
      buffer,
    };
  }

  private criarPaginas(consignacao: DetalheConsignacaoDto): PaginaPdf[] {
    const paginas: PaginaPdf[] = [];
    let comandos = this.criarCabecalho(consignacao);
    let y = 628;

    for (const item of consignacao.itens) {
      if (y < 88) {
        paginas.push(comandos);
        comandos = this.criarCabecalho(consignacao);
        y = 628;
      }

      this.adicionarLinhaItem(
        comandos,
        item,
        consignacao.percentualDesconto,
        y,
      );
      y -= 24;
    }

    this.adicionarTotais(comandos, consignacao, y - 16);
    paginas.push(comandos);

    return paginas;
  }

  private criarCabecalho(consignacao: DetalheConsignacaoDto): PaginaPdf {
    const comandos: string[] = [];

    this.adicionarTexto(
      comandos,
      'Relatório de consignação',
      40,
      792,
      16,
      true,
    );
    this.adicionarTexto(
      comandos,
      `Consignação #${consignacao.id}`,
      40,
      762,
      10,
      true,
    );
    this.adicionarTexto(
      comandos,
      `Revendedor: ${consignacao.revendedor.nome}`,
      40,
      744,
      10,
    );
    this.adicionarTexto(
      comandos,
      `Data: ${this.formatarData(consignacao.dataInclusao)}`,
      40,
      726,
      10,
    );
    this.adicionarTexto(
      comandos,
      `Desconto: ${this.formatarPercentual(consignacao.percentualDesconto)}`,
      40,
      708,
      10,
    );

    this.adicionarTexto(comandos, 'Codigo', 40, 662, 8, true);
    this.adicionarTexto(comandos, 'Produto', 82, 662, 8, true);
    this.adicionarTexto(comandos, 'Qtd', 292, 662, 8, true);
    this.adicionarTexto(comandos, 'Unitario', 328, 662, 8, true);
    this.adicionarTexto(comandos, 'Desc.', 388, 662, 8, true);
    this.adicionarTexto(comandos, 'Liquido', 440, 662, 8, true);
    this.adicionarTexto(comandos, 'Total', 510, 662, 8, true);
    this.adicionarLinha(comandos, 40, 654, 555, 654);

    return comandos;
  }

  private adicionarLinhaItem(
    comandos: string[],
    item: ItemConsignacaoDto,
    percentualDesconto: number,
    y: number,
  ): void {
    const descontoUnitario = this.calcularDesconto(
      item.valorUnitario,
      percentualDesconto,
    );
    const valorLiquido = item.valorUnitario - descontoUnitario;
    const totalLiquido = valorLiquido * item.quantidadeEnviada;

    this.adicionarTexto(comandos, String(item.codigoProduto), 40, y, 8);
    this.adicionarTexto(
      comandos,
      this.limitarTexto(item.nomeProduto, 36),
      82,
      y,
      8,
    );
    this.adicionarTexto(comandos, String(item.quantidadeEnviada), 292, y, 8);
    this.adicionarTexto(
      comandos,
      this.formatarMoeda(item.valorUnitario),
      328,
      y,
      8,
    );
    this.adicionarTexto(
      comandos,
      this.formatarMoeda(descontoUnitario),
      388,
      y,
      8,
    );
    this.adicionarTexto(comandos, this.formatarMoeda(valorLiquido), 440, y, 8);
    this.adicionarTexto(comandos, this.formatarMoeda(totalLiquido), 510, y, 8);
  }

  private adicionarTotais(
    comandos: string[],
    consignacao: DetalheConsignacaoDto,
    y: number,
  ): void {
    const totais = consignacao.itens.reduce(
      (totalizadores, item) => {
        const descontoUnitario = this.calcularDesconto(
          item.valorUnitario,
          consignacao.percentualDesconto,
        );
        const valorLiquido = item.valorUnitario - descontoUnitario;

        return {
          totalBruto:
            totalizadores.totalBruto +
            item.valorUnitario * item.quantidadeEnviada,
          totalDesconto:
            totalizadores.totalDesconto +
            descontoUnitario * item.quantidadeEnviada,
          totalLiquido:
            totalizadores.totalLiquido + valorLiquido * item.quantidadeEnviada,
        };
      },
      { totalBruto: 0, totalDesconto: 0, totalLiquido: 0 },
    );

    this.adicionarLinha(comandos, 40, y + 14, 555, y + 14);
    this.adicionarTexto(
      comandos,
      `Total bruto: ${this.formatarMoeda(totais.totalBruto)}`,
      328,
      y,
      9,
      true,
    );
    this.adicionarTexto(
      comandos,
      `Total desconto: ${this.formatarMoeda(totais.totalDesconto)}`,
      328,
      y - 18,
      9,
      true,
    );
    this.adicionarTexto(
      comandos,
      `Total liquido: ${this.formatarMoeda(totais.totalLiquido)}`,
      328,
      y - 36,
      10,
      true,
    );
  }

  private montarPdf(paginas: PaginaPdf[]): Buffer {
    const catalogoId = 1;
    const paginasId = 2;
    const fonteRegularId = 3;
    const fonteNegritoId = 4;
    const objetos: ObjetoPdf[] = [
      {
        id: fonteRegularId,
        conteudo:
          '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
      },
      {
        id: fonteNegritoId,
        conteudo:
          '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
      },
    ];
    const idsPaginas: number[] = [];
    let proximoId = 5;

    for (const pagina of paginas) {
      const conteudo = pagina.join('\n');
      const conteudoId = proximoId;
      const paginaId = proximoId + 1;
      proximoId += 2;
      idsPaginas.push(paginaId);

      objetos.push({
        id: conteudoId,
        conteudo: `<< /Length ${Buffer.byteLength(conteudo, 'latin1')} >>\nstream\n${conteudo}\nendstream`,
      });
      objetos.push({
        id: paginaId,
        conteudo:
          `<< /Type /Page /Parent ${paginasId} 0 R /MediaBox [0 0 595 842] ` +
          `/Resources << /Font << /F1 ${fonteRegularId} 0 R /F2 ${fonteNegritoId} 0 R >> >> ` +
          `/Contents ${conteudoId} 0 R >>`,
      });
    }

    objetos.push({
      id: paginasId,
      conteudo: `<< /Type /Pages /Kids [${idsPaginas
        .map((id) => `${id} 0 R`)
        .join(' ')}] /Count ${idsPaginas.length} >>`,
    });
    objetos.push({
      id: catalogoId,
      conteudo: `<< /Type /Catalog /Pages ${paginasId} 0 R >>`,
    });

    return this.serializarObjetos(objetos);
  }

  private serializarObjetos(objetos: ObjetoPdf[]): Buffer {
    const objetosOrdenados = [...objetos].sort((a, b) => a.id - b.id);
    const maiorId = Math.max(...objetosOrdenados.map((objeto) => objeto.id));
    const offsets = Array<number>(maiorId + 1).fill(0);
    let conteudo = '%PDF-1.4\n';

    for (const objeto of objetosOrdenados) {
      offsets[objeto.id] = Buffer.byteLength(conteudo, 'latin1');
      conteudo += `${objeto.id} 0 obj\n${objeto.conteudo}\nendobj\n`;
    }

    const inicioXref = Buffer.byteLength(conteudo, 'latin1');
    conteudo += `xref\n0 ${maiorId + 1}\n`;
    conteudo += '0000000000 65535 f \n';

    for (let id = 1; id <= maiorId; id += 1) {
      conteudo += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
    }

    conteudo += `trailer\n<< /Size ${maiorId + 1} /Root 1 0 R >>\n`;
    conteudo += `startxref\n${inicioXref}\n%%EOF`;

    return Buffer.from(conteudo, 'latin1');
  }

  private adicionarTexto(
    comandos: string[],
    texto: string,
    x: number,
    y: number,
    tamanho: number,
    negrito = false,
  ): void {
    comandos.push(
      `BT /F${negrito ? 2 : 1} ${tamanho} Tf ${x} ${y} Td (${this.escaparTexto(
        texto,
      )}) Tj ET`,
    );
  }

  private adicionarLinha(
    comandos: string[],
    xInicial: number,
    yInicial: number,
    xFinal: number,
    yFinal: number,
  ): void {
    comandos.push(`${xInicial} ${yInicial} m ${xFinal} ${yFinal} l S`);
  }

  private escaparTexto(texto: string): string {
    return texto
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7e]/g, ' ')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }

  private limitarTexto(texto: string, tamanho: number): string {
    return texto.length > tamanho ? `${texto.slice(0, tamanho - 3)}...` : texto;
  }

  private calcularDesconto(valor: number, percentualDesconto: number): number {
    return Math.round(valor * (percentualDesconto / 100));
  }

  private formatarMoeda(valor: number): string {
    return `R$ ${(valor / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  private formatarPercentual(valor: number): string {
    return `${valor.toLocaleString('pt-BR', {
      maximumFractionDigits: 2,
    })}%`;
  }

  private formatarData(data: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'America/Sao_Paulo',
    }).format(new Date(data));
  }
}
