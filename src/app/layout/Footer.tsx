/**
 * Rodapé discreto do conteúdo. Centraliza versão e crédito num único lugar
 * (APP_INFO) para facilitar alterações futuras.
 */
import { ExternalLink } from "lucide-react";

const APP_INFO = {
  version: "v1.0.0-prd",
  developer: "Willamy",
  developerUrl: "https://github.com/willamylp",
  iconInfoDevelpor: ExternalLink,
} as const;

export function Footer() {
  const IconDev = APP_INFO.iconInfoDevelpor;

  return (
    <footer className="mt-8 flex flex-col items-center justify-between gap-1 border-t border-border/60 pt-3 text-xs text-muted-foreground sm:flex-row">
      <span>
        Versão: <strong>{APP_INFO.version}</strong>
      </span>
      <span>
        Desenvolvido por:{" "}
        <a
          href={APP_INFO.developerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium font-semibold hover:font-bold text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {APP_INFO.developer}
          <IconDev className="size-[1em]" />
        </a>
      </span>
    </footer>
  );
}
