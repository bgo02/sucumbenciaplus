/**
 * Pre-built examples for testing the calculator.
 */

export interface ExampleData {
  label: string;
  description: string;
  periodosControvertidos: string;
  periodosAcolhidos: string;
  beneficioConcedido: boolean;
  dataAjuizamento: string;
  derPedida: string;
  dibFixada: string;
  marcoDefinidoPor: string;
  danoPedido: boolean;
  valorCausa: number;
  valorDanos: number;
  ajg: boolean;
  casasDecimais: number;
  limiarSucumbencia: number;
}

export const EXAMPLES: ExampleData[] = [
  {
    label: 'Exemplo 1 — Benefício não concedido, êxito alto em períodos',
    description: 'Sem dano moral, sem AJG. Maioria dos períodos acolhida mas benefício indeferido.',
    periodosControvertidos:
      '01/01/1990 a 31/12/1995\n01/06/1998 a 30/06/2003\n01/01/2005 a 31/12/2008',
    periodosAcolhidos:
      '01/01/1990 a 31/12/1995\n01/06/1998 a 30/06/2003',
    beneficioConcedido: false,
    dataAjuizamento: '15/03/2020',
    derPedida: '01/01/2019',
    dibFixada: '',
    marcoDefinidoPor: '',
    danoPedido: false,
    valorCausa: 0,
    valorDanos: 0,
    ajg: false,
    casasDecimais: 1,
    limiarSucumbencia: 10,
  },
  {
    label: 'Exemplo 2 — Benefício concedido, DIB = DER pedida, com AJG',
    description: 'Êxito médio em períodos. DIB fixada na data postulada. Parte autora com AJG.',
    periodosControvertidos:
      '01/03/1985 a 28/02/1990\n01/07/1995 a 30/06/2000\n01/01/2005 a 31/12/2010',
    periodosAcolhidos:
      '01/03/1985 a 28/02/1990\n01/01/2005 a 31/12/2010',
    beneficioConcedido: true,
    dataAjuizamento: '10/06/2022',
    derPedida: '01/01/2021',
    dibFixada: '01/01/2021',
    marcoDefinidoPor: 'DER original',
    danoPedido: false,
    valorCausa: 0,
    valorDanos: 0,
    ajg: true,
    casasDecimais: 1,
    limiarSucumbencia: 10,
  },
  {
    label: 'Exemplo 3 — DIB posterior, dano moral alto (redutor visível)',
    description: 'Benefício concedido com DIB diversa. Pedido de danos morais significativo.',
    periodosControvertidos:
      '01/01/1992 a 31/12/1997\n01/01/2000 a 31/12/2005\n01/01/2008 a 31/12/2012',
    periodosAcolhidos:
      '01/01/1992 a 31/12/1997\n01/01/2000 a 31/12/2005\n01/01/2008 a 31/12/2012',
    beneficioConcedido: true,
    dataAjuizamento: '01/07/2023',
    derPedida: '01/01/2020',
    dibFixada: '01/01/2022',
    marcoDefinidoPor: 'Reafirmação da DER',
    danoPedido: true,
    valorCausa: 150000,
    valorDanos: 50000,
    ajg: true,
    casasDecimais: 2,
    limiarSucumbencia: 10,
  },
];
