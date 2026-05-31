import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { DICTIONARIES } from "@/features/dicionarios/registry";
import { RELATORIOS, RELATORIOS_BASE } from "@/features/relatorios/registry";

// Code splitting por rota (PRD §12).
const HomePage = lazy(() =>
  import("@/features/home/HomePage").then((m) => ({ default: m.HomePage }))
);
const ProcedimentosListPage = lazy(() =>
  import("@/features/procedimentos/ProcedimentosListPage").then((m) => ({
    default: m.ProcedimentosListPage,
  }))
);
const ProcedimentoDetailPage = lazy(() =>
  import("@/features/procedimentos/ProcedimentoDetailPage").then((m) => ({
    default: m.ProcedimentoDetailPage,
  }))
);
const DictionaryList = lazy(() =>
  import("@/features/dicionarios/DictionaryList").then((m) => ({
    default: m.DictionaryList,
  }))
);
const DictionaryDetail = lazy(() =>
  import("@/features/dicionarios/DictionaryDetail").then((m) => ({
    default: m.DictionaryDetail,
  }))
);
const ReversaPage = lazy(() =>
  import("@/features/reversas/ReversaPage").then((m) => ({
    default: m.ReversaPage,
  }))
);
const RelatorioRelacionamento = lazy(() =>
  import("@/features/relatorios/RelatorioRelacionamento").then((m) => ({
    default: m.RelatorioRelacionamento,
  }))
);
const NotFoundPage = lazy(() =>
  import("@/features/NotFoundPage").then((m) => ({ default: m.NotFoundPage }))
);

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/procedimentos" element={<ProcedimentosListPage />} />
        <Route path="/procedimentos/:co" element={<ProcedimentoDetailPage />} />

        {/* Relatórios → Relacionamentos (config-driven, RF-02) */}
        <Route
          path="/relatorios"
          element={<Navigate to={`${RELATORIOS_BASE}/${RELATORIOS[0].slug}`} replace />}
        />
        <Route
          path={RELATORIOS_BASE}
          element={<Navigate to={`${RELATORIOS_BASE}/${RELATORIOS[0].slug}`} replace />}
        />
        {RELATORIOS.map((cfg) => (
          <Route
            key={cfg.slug}
            path={`${RELATORIOS_BASE}/${cfg.slug}`}
            element={<RelatorioRelacionamento config={cfg} />}
          />
        ))}

        {DICTIONARIES.map((config) => (
          <Route key={config.key}>
            <Route path={`/${config.key}`} element={<DictionaryList config={config} />} />
            {config.keyField && (
              <Route
                path={`/${config.key}/:co`}
                element={<DictionaryDetail config={config} />}
              />
            )}
            {config.reverse && (
              <Route
                path={`/${config.key}/:co/procedimentos`}
                element={<ReversaPage kind={config.reverse} />}
              />
            )}
          </Route>
        ))}

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
