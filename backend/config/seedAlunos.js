import AlunoMatricula from "../models/AlunoMatricula.js";

const alunosMockados = [
  { matricula: "2025001", nomeCompleto: "Ana Clara Souza", turma: "1º Ano A", turno: "Matutino" },
  {
    matricula: "2025002",
    nomeCompleto: "Bruno Oliveira Silva",
    turma: "1º Ano A",
    turno: "Matutino",
  },
  {
    matricula: "2025003",
    nomeCompleto: "Carla Mendes Santos",
    turma: "1º Ano B",
    turno: "Matutino",
  },
  { matricula: "2025004", nomeCompleto: "Daniel Costa Lima", turma: "2º Ano A", turno: "Matutino" },
  {
    matricula: "2025005",
    nomeCompleto: "Emily Ferreira Alves",
    turma: "2º Ano A",
    turno: "Matutino",
  },
  {
    matricula: "2025006",
    nomeCompleto: "Felipe Rodrigues Dias",
    turma: "2º Ano B",
    turno: "Matutino",
  },
  {
    matricula: "2025007",
    nomeCompleto: "Gabriel Santos Oliveira",
    turma: "3º Ano A",
    turno: "Vespertino",
  },
  {
    matricula: "2025008",
    nomeCompleto: "Helena Costa Pereira",
    turma: "3º Ano A",
    turno: "Vespertino",
  },
  {
    matricula: "2025009",
    nomeCompleto: "Igor Martins Ribeiro",
    turma: "3º Ano B",
    turno: "Vespertino",
  },
  {
    matricula: "2025010",
    nomeCompleto: "Julia Almeida Castro",
    turma: "3º Ano B",
    turno: "Vespertino",
  },
  { matricula: "2025011", nomeCompleto: "Kevin Barros Gomes", turma: "1º Ano A", turno: "Noturno" },
  {
    matricula: "2025012",
    nomeCompleto: "Larissa Novaes Teixeira",
    turma: "1º Ano A",
    turno: "Noturno",
  },
  {
    matricula: "2025013",
    nomeCompleto: "Marcos Vinícius Souza",
    turma: "2º Ano A",
    turno: "Matutino",
  },
  {
    matricula: "2025014",
    nomeCompleto: "Natália Cardoso Pinto",
    turma: "2º Ano A",
    turno: "Matutino",
  },
  {
    matricula: "2025015",
    nomeCompleto: "Otávio Henrique Lima",
    turma: "2º Ano B",
    turno: "Matutino",
  },
  {
    matricula: "2025016",
    nomeCompleto: "Patrícia dos Santos",
    turma: "3º Ano A",
    turno: "Vespertino",
  },
  {
    matricula: "2025017",
    nomeCompleto: "Quintino Augusto Neto",
    turma: "3º Ano A",
    turno: "Vespertino",
  },
  {
    matricula: "2025018",
    nomeCompleto: "Raquel Cristina Vieira",
    turma: "3º Ano B",
    turno: "Vespertino",
  },
  {
    matricula: "2025019",
    nomeCompleto: "Sérgio Luiz Machado",
    turma: "1º Ano A",
    turno: "Noturno",
  },
  {
    matricula: "2025020",
    nomeCompleto: "Tatiana Barbosa Rodrigues",
    turma: "1º Ano A",
    turno: "Noturno",
  },
];

export async function seedAlunosMockados() {
  try {
    const count = await AlunoMatricula.countDocuments();

    if (count === 0) {
      await AlunoMatricula.insertMany(alunosMockados);
      console.log("✅ Alunos mockados inseridos com sucesso");
    } else {
      console.log("ℹ️ Alunos mockados já existem no banco");
    }
  } catch (err) {
    console.error("❌ Erro ao inserir alunos mockados:", err.message);
  }
}

