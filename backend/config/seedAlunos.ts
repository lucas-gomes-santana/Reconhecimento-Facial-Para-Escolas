// Insere dados de matrículas fictícias para testes e desenvolvimento
// Em produção, a matrícula real deve ser cadastrada pelo gestor do sistema (super-admin)

import AlunoMatricula from "../models/AlunoMatricula.ts";

interface AlunoMock {
  matricula: string;
  cpf: string;
  nomeCompleto: string;
  turma: string;
  turno: "Matutino" | "Vespertino" | "Noturno";
}

const alunosMockados: AlunoMock[] = [
  {
    matricula: "2025001",
    cpf: "12345678901",
    nomeCompleto: "Ana Clara Souza",
    turma: "1º Ano A",
    turno: "Matutino",
  },
  {
    matricula: "2025002",
    cpf: "23456789012",
    nomeCompleto: "Bruno Oliveira Silva",
    turma: "1º Ano A",
    turno: "Matutino",
  },
  {
    matricula: "2025003",
    cpf: "34567890123",
    nomeCompleto: "Carla Mendes Santos",
    turma: "1º Ano B",
    turno: "Matutino",
  },
  {
    matricula: "2025004",
    cpf: "45678901234",
    nomeCompleto: "Daniel Costa Lima",
    turma: "2º Ano A",
    turno: "Matutino",
  },
  {
    matricula: "2025005",
    cpf: "56789012345",
    nomeCompleto: "Emily Ferreira Alves",
    turma: "2º Ano A",
    turno: "Matutino",
  },
  {
    matricula: "2025006",
    cpf: "67890123456",
    nomeCompleto: "Felipe Rodrigues Dias",
    turma: "2º Ano B",
    turno: "Matutino",
  },
  {
    matricula: "2025007",
    cpf: "78901234567",
    nomeCompleto: "Gabriel Santos Oliveira",
    turma: "3º Ano A",
    turno: "Vespertino",
  },
  {
    matricula: "2025008",
    cpf: "89012345678",
    nomeCompleto: "Helena Costa Pereira",
    turma: "3º Ano A",
    turno: "Vespertino",
  },
  {
    matricula: "2025009",
    cpf: "90123456789",
    nomeCompleto: "Igor Martins Ribeiro",
    turma: "3º Ano B",
    turno: "Vespertino",
  },
  {
    matricula: "2025010",
    cpf: "01234567890",
    nomeCompleto: "Julia Almeida Castro",
    turma: "3º Ano B",
    turno: "Vespertino",
  },
  {
    matricula: "2025011",
    cpf: "11223344556",
    nomeCompleto: "Kevin Barros Gomes",
    turma: "1º Ano A",
    turno: "Noturno",
  },
  {
    matricula: "2025012",
    cpf: "22334455667",
    nomeCompleto: "Larissa Novaes Teixeira",
    turma: "1º Ano A",
    turno: "Noturno",
  },
  {
    matricula: "2025013",
    cpf: "33445566778",
    nomeCompleto: "Marcos Vinícius Souza",
    turma: "2º Ano A",
    turno: "Matutino",
  },
  {
    matricula: "2025014",
    cpf: "44556677889",
    nomeCompleto: "Natália Cardoso Pinto",
    turma: "2º Ano A",
    turno: "Matutino",
  },
  {
    matricula: "2025015",
    cpf: "55667788990",
    nomeCompleto: "Otávio Henrique Lima",
    turma: "2º Ano B",
    turno: "Matutino",
  },
  {
    matricula: "2025016",
    cpf: "66778899001",
    nomeCompleto: "Paula Andrade Santos",
    turma: "3º Ano A",
    turno: "Vespertino",
  },
  {
    matricula: "2025017",
    cpf: "77889900112",
    nomeCompleto: "Quintino Dias Costa",
    turma: "3º Ano A",
    turno: "Vespertino",
  },
  {
    matricula: "2025018",
    cpf: "88990011223",
    nomeCompleto: "Rafaela Martins Lima",
    turma: "3º Ano B",
    turno: "Vespertino",
  },
  {
    matricula: "2025019",
    cpf: "99001122334",
    nomeCompleto: "Sérgio Augusto Ferreira",
    turma: "1º Ano A",
    turno: "Noturno",
  },
  {
    matricula: "2025020",
    cpf: "00112233445",
    nomeCompleto: "Tatiana Cristina Oliveira",
    turma: "1º Ano A",
    turno: "Noturno",
  },
];

export async function seedAlunosMockados(): Promise<void> {
  try {
    const count = await AlunoMatricula.countDocuments();
    if (count === 0) {
      await AlunoMatricula.insertMany(alunosMockados);
      console.log("Alunos mockados inseridos com sucesso!");
    } else {
      console.log("Alunos mockados já existem no banco de dados.");
    }
  } catch (err) {
    console.error("Erro ao executar seed de alunos:", err);
  }
}
