/**
 * Generates the "minuta" text for pasting into court decisions.
 * All canonical texts are defined here as templates.
 */

import { CalcResult } from './calculator';
import { formatDate } from './periodParser';

function pct(v: number, dec: number): string {
  return (v * 100).toFixed(dec) + '%';
}

function fmtMoney(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ============================================================
// CANONICAL TEMPLATES — edit here to change output text
// ============================================================

const TEMPLATES = {
  // A) Base — always present
  base: `Para a distribuição dos ônus de sucumbência, adoto critério objetivo de proveito econômico estimado, a partir do resultado efetivo dos pedidos formulados.`,

  // B) Bloco tempo de contribuição — always present
  blocoTempo: `Nos pedidos vinculados ao tempo de contribuição, considero dois componentes com pesos equivalentes: (i) o êxito no reconhecimento dos períodos controvertidos; e (ii) o êxito no pedido temporal de concessão do benefício na data postulada (DER/DIB), mensurado exclusivamente pela diferença entre a DER/DIB pedida e a DIB fixada, tomando por referência o retroativo existente na data do ajuizamento.`,

  // C1) Benefício não concedido
  benefNaoConcedido: (sp: string, sb: string) =>
    `No caso concreto, o êxito quanto aos períodos foi de ${sp}. Como o benefício não foi concedido, o componente relativo à concessão resulta em ${sb}.`,

  // C2) DIB = DER pedida (ou anterior)
  benefDibIgualDer: (sp: string, sb: string) =>
    `No caso concreto, o êxito quanto aos períodos foi de ${sp}. A DIB foi fixada na data postulada (ou em data anterior), razão pela qual o componente relativo à concessão resulta em ${sb}.`,

  // C3) DIB diversa e posterior
  benefDibDiversa: (sp: string, obtido: number, total: number, sb: string) =>
    `No caso concreto, o êxito quanto aos períodos foi de ${sp}. Como a DIB fixada é posterior à DER/DIB pedida, o componente relativo à concessão é estimado pela proporção do retroativo efetivamente obtido na data do ajuizamento, calculado a partir de ${obtido} dias de retroativo efetivo sobre ${total} dias de retroativo pretendido, resultando em ${sb}.`,

  // D) Fecho tempo
  fechoTempo: (st: string) =>
    `A partir desses dois componentes, obtém-se êxito combinado de ${st} nos pedidos relativos ao tempo de contribuição.`,

  // E) Dano moral
  danoMoral: (vd: string, vc: string, prop: string) =>
    `Além disso, havendo pedido de indenização por dano moral no valor de ${vd} dentro de valor de causa de ${vc}, aplico redutor proporcional de ${prop} ao êxito global, a fim de refletir objetivamente a parcela econômica que o pedido indenizatório representa na composição do valor da causa.`,

  // F) Resultado final
  resultadoFinal: (sf: string) =>
    `Com isso, o êxito global para fins de sucumbência resulta em ${sf}.`,

  // Conclusão sucumbência
  conclusao: (autorPct: string, reuPct: string) =>
    `Integra-se a sucumbência na proporção de ${autorPct}% em favor da parte autora e ${reuPct}% em favor da parte ré.`,

  // Honorários — benefício concedido
  honorConcedido: `Fixo os honorários advocatícios nos patamares mínimos do art. 85, §3º, do CPC, observada a base de cálculo prevista na Súmula 111 do STJ, incidindo sobre as parcelas vencidas até a data da sentença (ou do acórdão, se for o caso), na proporção de sucumbência acima apurada.`,

  // Honorários — benefício não concedido
  honorNaoConcedido: `Fixo os honorários advocatícios em 10% sobre o valor atualizado da causa, observada a proporção de sucumbência acima apurada.`,

  // AJG
  ajg: `Concedida a gratuidade da justiça, a exigibilidade das verbas de sucumbência eventualmente devidas pela parte autora fica suspensa, nos termos do art. 98, §3º, do CPC.`,

  // Custas
  custas: `Custas na forma da lei, observadas as isenções legais e a gratuidade da justiça, se deferida.`,
};

export function generateMinuta(r: CalcResult): string {
  const dec = r.casasDecimais;
  const parts: string[] = [];

  // 1) PREMISSAS
  parts.push(TEMPLATES.base);
  parts.push('');
  parts.push(TEMPLATES.blocoTempo);
  parts.push('');

  // Sub-bloco concessão
  const sp = pct(r.scorePeriodos, dec);
  const sb = pct(r.scoreBeneficio, dec);

  if (!r.beneficioConcedido) {
    parts.push(TEMPLATES.benefNaoConcedido(sp, sb));
  } else if (r.dibFixada && r.derPedida && r.dibFixada <= r.derPedida) {
    parts.push(TEMPLATES.benefDibIgualDer(sp, sb));
  } else {
    parts.push(TEMPLATES.benefDibDiversa(sp, r.obtidoDiasRetro, r.totalDiasRetro, sb));
  }
  parts.push('');

  // Fecho tempo
  parts.push(TEMPLATES.fechoTempo(pct(r.scoreTempo, dec)));
  parts.push('');

  // Dano moral
  if (r.danoPedido && r.propDecDanos > 0) {
    parts.push(TEMPLATES.danoMoral(
      fmtMoney(r.valorDanos),
      fmtMoney(r.valorCausa),
      pct(r.propDecDanos, dec)
    ));
    parts.push('');
  }

  // Resultado
  parts.push(TEMPLATES.resultadoFinal(pct(r.scoreFinal, dec)));
  parts.push('');

  // 2) CONCLUSÃO
  parts.push(TEMPLATES.conclusao(
    r.honorAutorPct.toFixed(dec),
    r.honorReuPct.toFixed(dec)
  ));
  parts.push('');

  // 3) HONORÁRIOS
  if (r.beneficioConcedido) {
    parts.push(TEMPLATES.honorConcedido);
  } else {
    parts.push(TEMPLATES.honorNaoConcedido);
  }
  parts.push('');

  // AJG
  if (r.ajg && r.autorShare < 1) {
    parts.push(TEMPLATES.ajg);
    parts.push('');
  }

  // Custas
  parts.push(TEMPLATES.custas);

  return parts.join('\n');
}

export function generateMemoria(r: CalcResult): string {
  const dec = r.casasDecimais;
  const lines: string[] = [];

  lines.push('═══ MEMÓRIA DE CÁLCULO ═══');
  lines.push('');

  lines.push('▸ PERÍODOS');
  lines.push(`  Dias controvertidos: ${r.diasCont}`);
  lines.push(`  Dias acolhidos: ${r.diasAcol}`);
  lines.push(`  Score períodos: ${pct(r.scorePeriodos, dec)}`);
  lines.push('');

  lines.push('▸ BENEFÍCIO / PEDIDO TEMPORAL');
  lines.push(`  Concedido: ${r.beneficioConcedido ? 'Sim' : 'Não'}`);
  if (r.ajuizamento) lines.push(`  Data do ajuizamento: ${formatDate(r.ajuizamento)}`);
  if (r.derPedida) lines.push(`  DER/DIB pedida: ${formatDate(r.derPedida)}`);
  if (r.dibFixada) lines.push(`  DIB fixada: ${formatDate(r.dibFixada)}`);
  if (r.marcoDefinidoPor) lines.push(`  Marco definido por: ${r.marcoDefinidoPor}`);
  if (r.beneficioConcedido) {
    lines.push(`  Retroativo pretendido (dias): ${r.totalDiasRetro}`);
    lines.push(`  Retroativo obtido (dias): ${r.obtidoDiasRetro}`);
  }
  lines.push(`  Score benefício: ${pct(r.scoreBeneficio, dec)}`);
  lines.push('');

  lines.push('▸ COMBINAÇÃO (50% períodos + 50% benefício)');
  lines.push(`  Score tempo: ${pct(r.scoreTempo, dec)}`);
  lines.push('');

  if (r.danoPedido) {
    lines.push('▸ DANO MORAL');
    lines.push(`  Valor da causa: ${fmtMoney(r.valorCausa)}`);
    lines.push(`  Valor danos morais: ${fmtMoney(r.valorDanos)}`);
    lines.push(`  Proporção (redutor): ${pct(r.propDecDanos, dec)}`);
    lines.push('');
  }

  lines.push('▸ RESULTADO');
  lines.push(`  Score final (êxito autor): ${pct(r.scoreFinal, dec)}`);
  lines.push(`  Sucumbência mínima aplicada: ${r.sucumbMinAplicada ? 'Sim' : 'Não'}`);
  if (r.sucumbMinAplicada) lines.push(`  Regra: ${r.sucumbMinRegra}`);
  lines.push(`  Proporção autor: ${pct(r.autorShare, dec)}`);
  lines.push(`  Proporção réu: ${pct(r.reuShare, dec)}`);
  lines.push(`  Honorários autor: ${r.honorAutorPct.toFixed(dec)}%`);
  lines.push(`  Honorários réu: ${r.honorReuPct.toFixed(dec)}%`);
  lines.push('');

  lines.push('▸ OBSERVAÇÕES');
  lines.push('  Contagem de dias: datas inclusivas, diferença em dias corridos + 1.');
  if (r.warnings.length > 0) {
    lines.push('  Avisos:');
    r.warnings.forEach(w => lines.push(`    ⚠ ${w.message}`));
  }

  return lines.join('\n');
}
