import { Link } from "react-router-dom";
import { Github, ScanFace, Info } from "lucide-react";
import "../styles/index.css";

function Footer() {
  return (
    <footer className="cerf-band-dark w-full py-6">
      <div className="max-w-5xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="cerf-icon-badge w-8 h-8">
            <ScanFace className="w-4 h-4" />
          </div>
          <span className="cerf-heading-on-dark text-sm font-semibold">
            C.E.R.F — Reconhecimento Facial Para Escolas
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/lucas-gomes-santana/Reconhecimento-Facial-Para-Escolas"
            target="_blank"
            rel="noopener noreferrer"
            className="cerf-footer-link inline-flex items-center gap-1 text-sm"
            aria-label="Repositório no GitHub"
          >
            <Github className="w-5 h-5" />
            Repositório
          </a>
          <Link to="/sobre" className="cerf-footer-link inline-flex items-center gap-1 text-sm">
            <Info className="w-5 h-5" />
            Sobre o Projeto
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
