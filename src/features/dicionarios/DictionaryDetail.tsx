import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useDictionaryDetail } from "@/api/queries";
import { PageHeader } from "@/components/common/PageHeader";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { CopyCode } from "@/components/common/CopyCode";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/states";
import { DictionaryFields, getDictionaryName } from "./DictionaryFields";
import type { DictionaryConfig } from "./registry";

type Row = Record<string, unknown>;

export function DictionaryDetail({ config }: { config: DictionaryConfig }) {
  const params = useParams();
  const co = params.co;

  const query = useDictionaryDetail<Row>(
    config.key,
    config.basePath,
    co,
    config.versioned
  );

  const data = query.data;
  const nome = getDictionaryName(config, data);

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: "Início", to: "/" },
          { label: config.label, to: `/${config.key}` },
          { label: co ?? "" },
        ]}
      />

      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : query.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <>
          <PageHeader
            title={
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <CopyCode value={co ?? ""} className="text-base font-normal" />
                {nome && <span>{nome}</span>}
              </span>
            }
            description={config.labelSingular}
            actions={
              config.reverse && co ? (
                <Button asChild>
                  <Link to={`/${config.key}/${encodeURIComponent(co)}/procedimentos`}>
                    Ver procedimentos
                    <ArrowRight />
                  </Link>
                </Button>
              ) : undefined
            }
          />

          <DictionaryFields config={config} data={data} />
        </>
      )}
    </div>
  );
}
