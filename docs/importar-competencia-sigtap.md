# Importar uma nova competência do SIGTAP

Guia operacional para carregar um pacote mensal do SIGTAP (uma competência `AAAAMM`)
no banco, usando o management command `importar_sigtap`. Para o desenho e as decisões
por trás da carga, veja [prd-sigtap.md](prd-sigtap.md).

> **Resumo:** baixar o pacote da competência no DATASUS → extrair os `.txt` para uma
> pasta → rodar `python manage.py importar_sigtap --competencia AAAAMM --dir <pasta>`.
> A carga é **transacional**, **idempotente** e mantém uma **janela das N competências
> mais recentes**.

---

## Pré-requisitos

- Repositório clonado e dependências instaladas (`venv` com `requirements.txt`).
- Arquivo `.env` apontando para o banco alvo (mesmas variáveis da aplicação:
  `SECRET_KEY`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, …).
- Migrações aplicadas no banco alvo: `python manage.py migrate`.
- Acesso de escrita ao banco onde a competência será carregada.

---

## Passo 1 — Baixar o pacote da competência

O SIGTAP é publicado mensalmente pelo DATASUS como um ZIP que é um **snapshot
completo** da competência (não um *diff*).

1. Acesse o portal da Tabela Unificada do SIGTAP do DATASUS — área de download
   (`http://sigtap.datasus.gov.br/tabela-unificada/app/sec/inicio.jsp`).
2. Selecione a competência no formato `AAAAMM` (ex.: `202606` = junho/2026) e baixe o
   ZIP (algo como `TabelaUnificada_202606_v<versão>.zip`).

> O download é **manual** — a aplicação não busca o pacote automaticamente.

---

## Passo 2 — Extrair os arquivos

Extraia o ZIP para uma pasta dedicada à competência. O importador lê **apenas** os
arquivos de dados de largura fixa nomeados por tabela (`tb_*.txt` e `rl_*.txt`); os
demais (`*_layout.txt`, `layout.txt`, `LEIA_ME.TXT`, `.xls` etc.) são ignorados.

```text
C:\sigtap\202606\
├── tb_procedimento.txt
├── tb_cid.txt
├── tb_ocupacao.txt
├── ...
├── rl_procedimento_cid.txt
├── rl_procedimento_ocupacao.txt
└── ...            (41 arquivos de tabela no total)
```

Pontos de atenção sobre os arquivos:

- **Encoding ISO-8859-1 (latin-1).** Não reabra/regrave os `.txt` em UTF-8 nem deixe
  um editor "normalizar" o arquivo. A leitura é **posicional** e em latin-1; um
  registro mais **longo** que o esperado aborta a carga.
- `--dir` deve apontar para a pasta que contém **diretamente** os `.txt` (se o ZIP
  criar uma subpasta, use o caminho dela).
- Um arquivo de tabela **ausente** gera erro (a menos que use `--permitir-faltantes`).
  Um arquivo **presente porém vazio** (ex.: `rl_procedimento_tuss.txt`) é carga de 0
  linhas, sem erro.

---

## Passo 3 — Preparar o ambiente

No diretório raiz do projeto (onde está o `manage.py`):

```powershell
# Ative o ambiente virtual
.\venv\Scripts\Activate.ps1

# Garanta que as migrações estão aplicadas
python manage.py migrate
```

> Se a *Execution Policy* do PowerShell bloquear o `Activate.ps1`, você pode chamar o
> Python do venv diretamente em cada comando: `.\venv\Scripts\python.exe manage.py …`

Por padrão, `DJANGO_SETTINGS_MODULE=app.settings` carrega o ambiente de
**desenvolvimento**. Para carregar em **produção**, selecione o settings adequado —
por exemplo definindo `DJANGO_ENVIRONMENT=PRD` no ambiente/`.env`, ou passando
`--settings=app.settings.producao` no comando.

> **Recomendado:** faça backup do banco antes de cargas em produção. A importação
> **remove** competências que ficarem fora da janela (ver Passo 5 e
> [Como funciona](#como-funciona-resumo)).

---

## Passo 4 — Simular a carga (`--dry-run`)

Antes de gravar, valide o pacote. O `--dry-run` processa e valida tudo (parsing,
larguras, competência, resolução de FKs) e faz **rollback** ao final, sem alterar o
banco.

```powershell
python manage.py importar_sigtap --competencia 202606 --dir "C:\sigtap\202606" --dry-run
```

Saída esperada: um relatório `[DRY-RUN]` com a contagem de registros por tabela e
eventuais "pulados" (FKs órfãs). Se algo estiver errado (competência divergente,
arquivo ausente, registro corrompido), o comando **aborta** com mensagem clara e nada
é gravado.

---

## Passo 5 — Importar de fato

```powershell
python manage.py importar_sigtap --competencia 202606 --dir "C:\sigtap\202606"
```

Opcionalmente, ajuste a janela de retenção (default 12 competências):

```powershell
python manage.py importar_sigtap --competencia 202606 --dir "C:\sigtap\202606" --janela 24
```

Ao final, o comando imprime o relatório com o total de registros e tabelas
carregadas. Toda a carga roda em uma transação: em qualquer erro é feito **rollback
completo** e a competência não fica vigente.

---

## Passo 6 — Verificar

**Pelo relatório do comando:** confira os totais por tabela (devem bater com a ordem
de grandeza do pacote; ex.: `rl_procedimento_ocupacao` na casa das ~190 mil linhas).

**Pela API** (com o servidor rodando — `python manage.py runserver`):

```text
GET /api/v1/sigtap/competencias/
```

A nova competência deve aparecer na lista, com a mais recente marcada como `vigente`.
Consultas sem `?competencia=AAAAMM` passam a usar a competência vigente.

**Pelo shell** (alternativa, sem subir o servidor):

```powershell
python manage.py shell -c "from sigtap.models.competencia import Competencia; print(list(Competencia.objects.order_by('-codigo').values_list('codigo','vigente')))"
```

---

## Referência das opções

| Opção | Obrigatória | Default | Descrição |
|---|---|---|---|
| `--competencia AAAAMM` | sim | — | Competência a carregar (6 dígitos). Deve bater com o `DT_COMPETENCIA` dos arquivos. |
| `--dir <pasta>` | sim | — | Pasta com os `.txt` da competência. |
| `--janela N` | não | `12` | Nº de competências mantidas; as mais antigas são podadas após a carga (`N ≥ 1`). |
| `--dry-run` | não | desligado | Processa e valida sem gravar (rollback ao final). |
| `--permitir-faltantes` | não | desligado | Não falha se algum arquivo de tabela estiver ausente (carrega o que houver). |
| `-v {0,1,2,3}` | não | `1` | Verbosidade (Django). `-v 0` silencia o relatório; `-v 2` ou mais detalha os pulos. |

---

## Como funciona (resumo)

- **Idempotente:** a carga limpa as linhas daquela competência e recarrega.
  Reexecutar a mesma competência produz exatamente o mesmo estado — pode rodar de
  novo sem medo.
- **Transacional:** tudo dentro de `transaction.atomic()`; em erro, rollback total.
- **Janela de N competências:** após o sucesso, competências além da janela (default
  12) são removidas (dados versionados em cascata). Os **dicionários globais** (CID,
  ocupação, TUSS, RENASES, redes de atenção, regras condicionadas, grupos de
  habilitação) são *upsert* por chave natural e **não** são podados.
- **Vigente = maior `AAAAMM`:** depois da carga, a competência de maior código vira a
  vigente. Carregar uma competência **antiga** (backfill) não muda a vigente se já
  houver uma mais nova.
- **Validação de competência:** se o `DT_COMPETENCIA` de um arquivo divergir do
  `--competencia`, a carga aborta (evita gravar o pacote errado sob a competência
  informada).

---

## Solução de problemas

| Mensagem / sintoma | Causa provável | O que fazer |
|---|---|---|
| `--competencia deve estar no formato AAAAMM (6 dígitos).` | Valor inválido. | Use 6 dígitos, ex.: `202606`. |
| `Pasta não encontrada: ...` | `--dir` errado. | Aponte para a pasta com os `.txt` extraídos. |
| `Arquivo de tabela ausente: ...` | Falta um `.txt` esperado. | Reextraia o ZIP completo; ou use `--permitir-faltantes` se a ausência for intencional. |
| `... competência XXXXXX difere de --competencia YYYYYY.` | Pacote de outra competência. | Confirme que a pasta corresponde ao `--competencia` informado. |
| `... linha N: registro com X caracteres; esperado Y` | Arquivo corrompido ou reconvertido (encoding/quebra de linha). | Reextraia do ZIP original; não regrave em UTF-8. |
| Muitos "pulados" no relatório | FKs órfãs (procedimento/CID/registro sem correspondente). | Pequena quantidade é normal; se massivo, o pacote pode estar incompleto. |

> Em qualquer falha, a transação faz rollback — o banco permanece no estado anterior.
> Corrija a causa e rode novamente.
