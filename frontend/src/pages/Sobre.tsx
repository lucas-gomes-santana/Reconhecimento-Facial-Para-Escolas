import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ScanFace,
  ShieldCheck,
  Users,
  Github,
  Linkedin,
  Globe,
  GraduationCap,
  Code2,
} from "lucide-react";
import "../styles/index.css";

function SobreProjeto() {
  const equipe = [
    { nome: "Lucas Gomes Santana", papel: "Desenvolvedor Principal" },
    { nome: "Deisiane Silva do Nascimento", papel: "Integrante da equipe" },
    { nome: "Gisele Machado Lima", papel: "Integrante da equipe" },
    { nome: "Gleice Kelly Almeida Reis", papel: "Integrante da equipe" },
    { nome: "Kauane Rodrigues Silva", papel: "Integrante da equipe" },
  ];

  return (
    <div className="cerf-scan-bg min-h-screen p-8">
      <div className="w-full max-w-4xl mx-auto">
        {/* Voltar */}
        <Link
          to="/menu"
          className="cerf-accent-text inline-flex items-center gap-2 mb-6 text-sm font-medium hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao menu
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="cerf-icon-badge w-16 h-16">
              <ScanFace className="w-10 h-10" />
            </div>
          </div>
          <h1 className="cerf-heading-on-dark text-3xl md:text-4xl mb-2">
            Sobre o Projeto C.E.R.F
          </h1>
          <p className="cerf-subtext-on-dark max-w-2xl mx-auto">
            Cadastro Escolar com Reconhecimento Facial — um sistema de segurança biométrica pensado
            para o ambiente escolar.
          </p>
        </div>

        <div className="space-y-6">
          <section className="cerf-surface p-6 md:p-8">
            <h2 className="cerf-heading text-xl md:text-2xl mb-4 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 cerf-accent-text" />
              Como o projeto surgiu
            </h2>
            <p className="cerf-subtext leading-relaxed mb-3">
              O C.E.R.F nasceu como um projeto acadêmico desenvolvido no Curso Técnico em
              Informática do Centro Territorial de Educação Profissional da Bacia do Jacuípe
              (CETEP), em Ipirá, Bahia, sob orientação do Professor Willison. A ideia surgiu da
              vontade da equipe de aplicar conhecimentos de desenvolvimento web e visão
              computacional na resolução de um problema real: a segurança nas instituições de
              ensino.
            </p>
            <p className="cerf-subtext leading-relaxed">
              O projeto foi apresentado como trabalho de conclusão do curso técnico e como
              iniciativa para feiras de ciências, com o objetivo de demonstrar, na prática, como
              tecnologias de reconhecimento facial podem ser aplicadas para fortalecer o controle de
              acesso em escolas, indo além da teoria e chegando a um protótipo totalmente funcional.
            </p>
          </section>

          <section className="cerf-surface p-6 md:p-8">
            <h2 className="cerf-heading text-xl md:text-2xl mb-4 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 cerf-accent-text" />
              Por que foi desenvolvido
            </h2>
            <p className="cerf-subtext leading-relaxed mb-3">
              A segurança escolar tem se tornado uma preocupação cada vez mais presente, agravada
              pelo aumento de incidentes de violência e por falhas no controle de acesso às unidades
              de ensino. O C.E.R.F propõe uma resposta tecnológica a esse cenário, usando o
              reconhecimento facial como método de autenticação biométrica, mais difícil de
              falsificar ou compartilhar do que crachás ou senhas convencionais.
            </p>
            <p className="cerf-subtext leading-relaxed">
              Além de barrar acessos não autorizados, o sistema também apoia a gestão escolar do dia
              a dia: controle do fluxo de entrada de alunos, professores e funcionários, controle de
              retirada de merenda e geração de estatísticas de uso, dados que ajudam a instituição a
              planejar melhor seus recursos.
            </p>
          </section>

          <section className="cerf-surface p-6 md:p-8">
            <h2 className="cerf-heading text-xl md:text-2xl mb-4 flex items-center gap-2">
              <ScanFace className="w-6 h-6 cerf-accent-text" />
              Como funciona
            </h2>
            <p className="cerf-subtext leading-relaxed mb-3">
              O cadastro de cada usuário gera um descriptor facial, uma representação numérica única
              do rosto, extraída por um modelo de reconhecimento treinado com TensorFlow.js através
              da biblioteca face-api.js. Esse descriptor é cadastrado no banco de dados para
              comparação matemática futura com os rostos escaneados pela câmera.
            </p>
            <p className="cerf-subtext leading-relaxed">
              As comparações faciais do sistema alcançam entre 96% e 99,5% de precisão em condições
              ideais de iluminação, ângulo e distância.
            </p>
          </section>

          <section className="cerf-surface p-6 md:p-8">
            <h2 className="cerf-heading text-xl md:text-2xl mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 cerf-accent-text" />
              Equipe de desenvolvimento
            </h2>
            <p className="cerf-subtext leading-relaxed mb-5">
              O C.E.R.F foi idealizado e construído por uma equipe de estudantes do curso técnico em
              Informática do CETEP Ipirá, com orientação do Professor Willison:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {equipe.map((membro) => (
                <div key={membro.nome} className="cerf-panel-muted-item p-3">
                  <p className="cerf-heading text-sm">{membro.nome}</p>
                  <p className="cerf-subtext text-xs">{membro.papel}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="cerf-surface p-6 md:p-8">
            <h2 className="cerf-heading text-xl md:text-2xl mb-4 flex items-center gap-2">
              <Code2 className="w-6 h-6 cerf-accent-text" />
              Desenvolvedor Principal
            </h2>
            <p className="cerf-subtext leading-relaxed mb-5">
              O desenvolvimento técnico do C.E.R.F(arquitetura do sistema, backend, frontend e
              integração do reconhecimento facial) foi conduzido por{" "}
              <strong className="cerf-heading">Lucas Gomes Santana</strong>, estudante de curso
              Médio/Técnico de Informática e desenvolvedor full-stack.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.linkedin.com/in/lucas-gomes-santana-77892a343/"
                target="_blank"
                rel="noopener noreferrer"
                className="cerf-btn-info flex items-center gap-2 px-5 py-2.5"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
              <a
                href="https://github.com/lucas-gomes-santana"
                target="_blank"
                rel="noopener noreferrer"
                className="cerf-btn-primary flex items-center gap-2 px-5 py-2.5"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <a
                href="https://lucas-gomes-santana-portifolio.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="cerf-btn-primary flex items-center gap-2 px-5 py-2.5"
              >
                <Globe className="w-4 h-4" />
                Portfólio
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default SobreProjeto;
