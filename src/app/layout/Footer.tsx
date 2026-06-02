/**
 * Rodapé discreto do conteúdo. Centraliza versão e crédito num único lugar
 * (APP_INFO) para facilitar alterações futuras.
 */
import { ExternalLink, Github, Heart, Copy, Check } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const APP_INFO = {
  version: "v1.0.0-prd",
  developer: "Willamy",
  developerUrl: "https://github.com/willamylp",
  repoUrl: "https://github.com/willamylp/sigtap-frontend",
  iconInfoDevelpor: ExternalLink,
} as const;

function SupportDialog() {
  const [copied, setCopied] = useState(false);
  const pixKey =
    "00020126870014br.gov.bcb.pix0136b14570ec-e492-49b6-a81e-cfbbcb101b390225Manutencao do novo SIGTAP5204000053039865802BR5924Willamy Domingos de Oliv6009Sao Paulo62230519daqr22275709755025863048172";

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex uppercase font-semibold items-center gap-1 font-medium hover:font-bold text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all">
          <Heart className="size-[1.2em] text-red-500 fill-red-500/20" />
          Apoie o Projeto
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pb-3 uppercase">
            <Heart className="h-5 w-5 text-red-500 fill-red-500" /> Apoie o Projeto
          </DialogTitle>
          <DialogDescription>
            Este é um projeto público e gratuito. Sua ajuda é fundamental para manter os servidores no ar e financiar melhorias contínuas. Qualquer valor é muito bem-vindo!
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-4 sm:flex-row sm:items-start">
          <div className="shrink-0 flex flex-col items-center gap-2">
            <div className="rounded-xl border-2 border-primary/20 bg-white p-2 shadow-sm">
              <img src="/qrcode_pix.jpeg" alt="QR Code PIX" className="h-40 w-40" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Escaneie o QR Code</span>
          </div>
          <div className="flex flex-1 flex-col gap-2 w-full">
            <p className="text-sm font-medium">Ou use o PIX Copia e Cola:</p>
            <div className="relative group">
              <div className="bg-muted p-3 rounded-md text-xs break-all border min-h-[6rem]">
                {pixKey}
              </div>
            </div>
            <Button
              className="w-full mt-1"
              variant={copied ? "default" : "secondary"}
              onClick={handleCopy}
            >
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Chave Copiada!" : "Copiar Chave PIX"}
            </Button>
            {copied && (
              <p className="text-xs text-center text-green-600 dark:text-green-400 font-medium animate-in fade-in slide-in-from-top-1">
                Código copiado para a área de transferência! <br />Obrigado pela colaboração!
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Footer() {
  const IconDev = APP_INFO.iconInfoDevelpor;

  return (
    <footer className="sticky bottom-0 z-40 mt-8 -mx-4 -mb-6 px-4 pb-6 pt-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 flex flex-col items-center justify-between gap-1 border-t border-border/60 bg-slate-100/95 backdrop-blur supports-[backdrop-filter]:bg-slate-100/80 dark:bg-slate-800/95 dark:supports-[backdrop-filter]:bg-slate-800/80 text-xs text-muted-foreground sm:flex-row">
      <span className="flex items-center gap-2">
        <span>
          Versão: <strong>{APP_INFO.version}</strong>
        </span>
        <span className="text-border">|</span>
        <SupportDialog />
      </span>
      <span className="inline-flex items-center gap-2">
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
        <span className="text-border">|</span>
        <a
          href={APP_INFO.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium hover:font-bold text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          title="Código fonte no GitHub"
        >
          <Github className="size-[1em]" />
          Código Fonte
        </a>
      </span>
    </footer>
  );
}

