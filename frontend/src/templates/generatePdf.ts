import jsPDF from 'jspdf';

interface UsuarioPorTipo {
  _id: string;
  quantidade: number;
}

interface DadosEstatisticas {
  totalCadastros: number;
  totalVerificacoes: number;
  usuariosPorTipo?: UsuarioPorTipo[];
  primeiroCadastro?: string;
  ultimoCadastro?: string;
  ultimaAtualizacao: string;
}

export const gerarRelatorioPdf = (dadosEstatisticas: DadosEstatisticas) => {
  const doc = new jsPDF();

  const layoutConfig = {
    // Margens e espaçamentos
    marginLeft: 15,
    marginRight: 15,
    pageWidth: 210,
    
    // Alturas e espaçamentos
    lineHeight: 6,
    sectionSpacing: 10,
    titleSpacing: 15,
    smallSpacing: 5,
    
    // Posições iniciais
    startY: 15,
    
    // Tamanhos de fonte
    titleFontSize: 22,
    sectionTitleFontSize: 14,
    normalFontSize: 10
  };

  let currentY = layoutConfig.startY;

  // ========== TÍTULO PRINCIPAL ==========
  doc.setFontSize(layoutConfig.titleFontSize);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Estatísticas', layoutConfig.marginLeft, currentY);
  currentY += layoutConfig.titleSpacing;

  // ========== DATA DO RELATÓRIO ==========
  doc.setFontSize(layoutConfig.normalFontSize);
  doc.setFont('helvetica', 'normal');
  const dataAtual = new Date().toLocaleString('pt-BR');
  doc.text(`Gerado em: ${dataAtual}`, layoutConfig.marginLeft, currentY);
  currentY += layoutConfig.sectionSpacing;

  // ========== LINHA DIVISÓRIA ==========
  doc.setLineWidth(0.5);
  doc.line(layoutConfig.marginLeft, currentY, layoutConfig.pageWidth - layoutConfig.marginRight, currentY);
  currentY += layoutConfig.sectionSpacing;

  // ========== ESTATÍSTICAS GERAIS ==========
  doc.setFontSize(layoutConfig.sectionTitleFontSize);
  doc.setFont('helvetica', 'bold');
  doc.text('Estatísticas Gerais', layoutConfig.marginLeft, currentY);
  currentY += layoutConfig.sectionSpacing;

  doc.setFontSize(layoutConfig.normalFontSize);
  doc.setFont('helvetica', 'normal');
  
  // Box de Total de Cadastros
  doc.setFillColor(219, 234, 254); // bg-blue-100
  doc.rect(layoutConfig.marginLeft, currentY - 5, 85, 15, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Total de Cadastros:', layoutConfig.marginLeft + 3, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${dadosEstatisticas.totalCadastros}`, layoutConfig.marginLeft + 3, currentY + 7);

  // Box de Total de Verificações
  doc.setFillColor(220, 252, 231); // bg-green-100
  doc.rect(layoutConfig.marginLeft + 95, currentY - 5, 85, 15, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Total de Verificações:', layoutConfig.marginLeft + 98, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${dadosEstatisticas.totalVerificacoes}`, layoutConfig.marginLeft + 98, currentY + 7);
  
  currentY += 20;

  // ========== USUÁRIOS POR TIPO ==========
  if (dadosEstatisticas.usuariosPorTipo && dadosEstatisticas.usuariosPorTipo.length > 0) {
    doc.setFontSize(layoutConfig.sectionTitleFontSize);
    doc.setFont('helvetica', 'bold');
    doc.text('Usuários por Tipo', layoutConfig.marginLeft, currentY);
    currentY += layoutConfig.sectionSpacing;

    doc.setFontSize(layoutConfig.normalFontSize);
    
    // Tabela de usuários por tipo
    dadosEstatisticas.usuariosPorTipo.forEach((tipo, index) => {
      // Alternar cores de fundo
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251); // bg-gray-50
        doc.rect(layoutConfig.marginLeft, currentY - 4, 180, 8, 'F');
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`${tipo._id}:`, layoutConfig.marginLeft + 3, currentY);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`${tipo.quantidade} usuário(s)`, layoutConfig.marginLeft + 100, currentY);
      
      currentY += layoutConfig.lineHeight + 2;
    });

    currentY += layoutConfig.smallSpacing;
  }

  // ========== INFORMAÇÕES ADICIONAIS ==========
  doc.setFontSize(layoutConfig.sectionTitleFontSize);
  doc.setFont('helvetica', 'bold');
  doc.text('Informações Adicionais', layoutConfig.marginLeft, currentY);
  currentY += layoutConfig.sectionSpacing;

  doc.setFontSize(layoutConfig.normalFontSize);
  doc.setFont('helvetica', 'normal');

  if (dadosEstatisticas.primeiroCadastro) {
    const dataPrimeiro = new Date(dadosEstatisticas.primeiroCadastro).toLocaleString('pt-BR');
    doc.text(`Primeiro Cadastro: ${dataPrimeiro}`, layoutConfig.marginLeft, currentY);
    currentY += layoutConfig.lineHeight;
  }

  if (dadosEstatisticas.ultimoCadastro) {
    const dataUltimo = new Date(dadosEstatisticas.ultimoCadastro).toLocaleString('pt-BR');
    doc.text(`Último Cadastro: ${dataUltimo}`, layoutConfig.marginLeft, currentY);
    currentY += layoutConfig.lineHeight;
  }

  const dataAtualizacao = new Date(dadosEstatisticas.ultimaAtualizacao).toLocaleString('pt-BR');
  doc.text(`Última Atualização: ${dataAtualizacao}`, layoutConfig.marginLeft, currentY);
  currentY += layoutConfig.sectionSpacing;

  // ========== RODAPÉ ==========
  const pageHeight = 297;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text(
    'C.E.R.F - Sistema de Reconhecimento Facial',
    layoutConfig.pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  // ========== SALVAR PDF ==========
  const nomeArquivo = `relatorio-estatisticas-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(nomeArquivo);
};