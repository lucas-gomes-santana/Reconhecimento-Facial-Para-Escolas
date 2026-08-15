import jsPDF from "jspdf";

import type { DadosEstatisticas } from "../types/estatisticas.types";

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
    normalFontSize: 10,
  };

  let currentY = layoutConfig.startY;

  // Título principal
  doc.setFontSize(layoutConfig.titleFontSize);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Estatísticas", layoutConfig.marginLeft, currentY);
  currentY += layoutConfig.titleSpacing;

  // Data do relatório
  doc.setFontSize(layoutConfig.normalFontSize);
  doc.setFont("helvetica", "normal");
  const dataAtual = new Date().toLocaleString("pt-BR");
  doc.text(`Gerado em: ${dataAtual}`, layoutConfig.marginLeft, currentY);
  currentY += layoutConfig.sectionSpacing;

  // Linha divisória
  doc.setLineWidth(0.5);
  doc.line(
    layoutConfig.marginLeft,
    currentY,
    layoutConfig.pageWidth - layoutConfig.marginRight,
    currentY,
  );
  currentY += layoutConfig.sectionSpacing;

  // Estatísticas gerais
  doc.setFontSize(layoutConfig.sectionTitleFontSize);
  doc.setFont("helvetica", "bold");
  doc.text("Estatísticas Gerais", layoutConfig.marginLeft, currentY);
  currentY += layoutConfig.sectionSpacing;

  doc.setFontSize(layoutConfig.normalFontSize);
  doc.setFont("helvetica", "normal");

  // Box de Total de Cadastros
  doc.setFillColor(219, 234, 254); // bg-blue-100
  doc.rect(layoutConfig.marginLeft, currentY - 5, 85, 15, "F");
  doc.setFont("helvetica", "bold");
  doc.text("Total de Cadastros:", layoutConfig.marginLeft + 3, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(`${dadosEstatisticas.totalCadastros}`, layoutConfig.marginLeft + 3, currentY + 7);

  // Box de Total de Verificações
  doc.setFillColor(220, 252, 231); // bg-green-100
  doc.rect(layoutConfig.marginLeft + 95, currentY - 5, 85, 15, "F");
  doc.setFont("helvetica", "bold");
  doc.text("Total de Verificações:", layoutConfig.marginLeft + 98, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(`${dadosEstatisticas.totalVerificacoes}`, layoutConfig.marginLeft + 98, currentY + 7);

  currentY += 20;

  // Usuários por tipo
  if (dadosEstatisticas.usuariosPorTipo && dadosEstatisticas.usuariosPorTipo.length > 0) {
    doc.setFontSize(layoutConfig.sectionTitleFontSize);
    doc.setFont("helvetica", "bold");
    doc.text("Usuários por Tipo", layoutConfig.marginLeft, currentY);
    currentY += layoutConfig.sectionSpacing;

    doc.setFontSize(layoutConfig.normalFontSize);

    // Tabela de usuários por tipo
    dadosEstatisticas.usuariosPorTipo.forEach((tipo, index) => {
      // Alternar cores de fundo
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251); // bg-gray-50
        doc.rect(layoutConfig.marginLeft, currentY - 4, 180, 8, "F");
      }

      doc.setFont("helvetica", "bold");
      doc.text(`${tipo._id}:`, layoutConfig.marginLeft + 3, currentY);

      doc.setFont("helvetica", "normal");
      doc.text(`${tipo.quantidade} usuário(s)`, layoutConfig.marginLeft + 100, currentY);

      currentY += layoutConfig.lineHeight + 2;
    });

    currentY += layoutConfig.smallSpacing;
  }

  // Lista completa de usuários com data de cadastro
  if (dadosEstatisticas.usuariosOrganizados && dadosEstatisticas.usuariosOrganizados.length > 0) {
    // Verificar se precisa adicionar nova página
    if (currentY > 200) {
      doc.addPage();
      currentY = layoutConfig.startY;
    }

    doc.setFontSize(layoutConfig.sectionTitleFontSize);
    doc.setFont("helvetica", "bold");
    doc.text("Lista Completa de Usuários", layoutConfig.marginLeft, currentY);
    currentY += layoutConfig.sectionSpacing;

    dadosEstatisticas.usuariosOrganizados.forEach((grupo) => {
      // Verificar espaço antes de cada grupo
      if (currentY > 250) {
        doc.addPage();
        currentY = layoutConfig.startY;
      }

      // Título do tipo
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setFillColor(240, 240, 240);
      doc.rect(layoutConfig.marginLeft, currentY - 4, 180, 8, "F");
      doc.text(`${grupo.tipo} (${grupo.quantidade})`, layoutConfig.marginLeft + 3, currentY);
      currentY += 10;

      // Lista de nomes com data de cadastro
      doc.setFontSize(layoutConfig.normalFontSize);
      doc.setFont("helvetica", "normal");

      grupo.usuarios.forEach((usuario, index) => {
        // Verificar se precisa de nova página
        if (currentY > 280) {
          doc.addPage();
          currentY = layoutConfig.startY;
        }

        // Formatar data de cadastro
        const dataCadastro = usuario.dataCadastro
          ? new Date(usuario.dataCadastro).toLocaleString("pt-BR")
          : "Data não disponível";

        // Numeração, nome e data
        doc.setFont("helvetica", "normal");
        doc.text(`${index + 1}. ${usuario.nome}`, layoutConfig.marginLeft + 5, currentY);

        // Data de cadastro alinhada à direita
        doc.setFont("helvetica", "italic");
        doc.setTextColor(40, 40, 40);
        doc.text(
          "Data de Cadastro: ",
          layoutConfig.pageWidth - layoutConfig.marginRight - 70,
          currentY,
        );
        doc.text(dataCadastro, layoutConfig.pageWidth - layoutConfig.marginRight - 40, currentY);
        doc.setTextColor(0, 0, 0); // Resetar cor para preto

        currentY += layoutConfig.lineHeight;
      });

      currentY += layoutConfig.smallSpacing;
    });

    currentY += layoutConfig.sectionSpacing;
  }

  // Informações adicionais
  doc.setFontSize(layoutConfig.sectionTitleFontSize);
  doc.setFont("helvetica", "bold");
  doc.text("Informações Adicionais", layoutConfig.marginLeft, currentY);
  currentY += layoutConfig.sectionSpacing;

  doc.setFontSize(layoutConfig.normalFontSize);
  doc.setFont("helvetica", "normal");

  if (dadosEstatisticas.primeiroCadastro) {
    const dataPrimeiro = new Date(dadosEstatisticas.primeiroCadastro).toLocaleString("pt-BR");
    doc.text(`Primeiro Cadastro: ${dataPrimeiro}`, layoutConfig.marginLeft, currentY);
    currentY += layoutConfig.lineHeight;
  }

  if (dadosEstatisticas.ultimoCadastro) {
    const dataUltimo = new Date(dadosEstatisticas.ultimoCadastro).toLocaleString("pt-BR");
    doc.text(`Último Cadastro: ${dataUltimo}`, layoutConfig.marginLeft, currentY);
    currentY += layoutConfig.lineHeight;
  }

  const dataAtualizacao = new Date(dadosEstatisticas.ultimaAtualizacao).toLocaleString("pt-BR");
  doc.text(`Última Atualização: ${dataAtualizacao}`, layoutConfig.marginLeft, currentY);
  currentY += layoutConfig.sectionSpacing;

  // Rodapé
  const pageHeight = 295;
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text(
    "C.E.R.F - Sistema de Reconhecimento Facial",
    layoutConfig.pageWidth / 2,
    pageHeight - 10,
    { align: "center" },
  );

  const nomeArquivo = `relatorio-estatisticas-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(nomeArquivo);
};
