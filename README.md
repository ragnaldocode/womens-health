# Preventiva — saúde preventiva feminina

Aplicativo mobile (Android + iOS) que reúne os exames preventivos recomendados para mulheres,
personaliza a lista pela idade calculada a partir da data de nascimento e permite registrar os
exames já realizados. Funciona **offline**, sem cadastro, login ou servidor.

> **Estado do conteúdo:** o catálogo está marcado como `pendente_de_validacao_clinica`.
> O app é informativo, não faz diagnóstico e não substitui consulta profissional. A validação por
> profissional de saúde habilitado é pré-requisito para publicação.

## Escopo do MVP

| Tela | O que faz |
| --- | --- |
| Onboarding | Pede **somente** a data de nascimento; mostra a idade calculada como conferência |
| Início | Resumo (realizados / pendentes na faixa etária), progresso, recomendações e aviso de conteúdo |
| Lista | Busca por nome/finalidade, filtro por categoria, alternância entre "minha faixa etária" e catálogo completo, filtro de não realizados |
| Detalhes | Finalidade, faixa etária, periodicidade, ressalvas, fonte oficial e data da última revisão; registro e histórico de realizações |

## Stack

- **Expo SDK 58** / React Native 0.88 / React 19, TypeScript strict
- **Expo Router** (rotas por arquivo em `src/app`)
- **Expo SQLite** para persistência local (Android/iOS)
- **JSON embutido** para o catálogo de exames
- Sem backend, sem autenticação, sem notificações push, sem integrações externas

## Estrutura

```
src/
  app/                 # rotas (expo-router): index, lista, exame/[id], onboarding
  components/          # UI reutilizável (cards, chips, campos de data, botões)
  data/
    exams.json         # catálogo de exames (conteúdo + fontes)
    catalog.ts         # carrega e valida o catálogo na inicialização
  domain/
    age.ts             # idade exata, faixas etárias, validação de datas (puro)
    exams.ts           # tipos do catálogo, busca, filtros, resumo (puro)
  hooks/
    use-app-data.tsx   # estado global: perfil, registros, idade derivada
  storage/
    index.ts           # escolhe o adaptador por plataforma
    sqlite.ts          # SQLite (nativo)
    sqlite.web.ts      # stub de plataforma (web não usa SQLite)
    web.ts             # localStorage (apenas verificação no navegador)
  lib/format.ts        # formatação de datas pt-BR
  theme.ts             # paleta rosa, tipografia de display, espaçamento e sombras
scripts/
  verify-domain.mjs    # 86 verificações da lógica, sem framework de teste
```

`src/domain/*` não importa React nem outros módulos: é o que permite rodar a verificação
diretamente no Node.

## Idade: sempre calculada, nunca armazenada

A data de nascimento (`YYYY-MM-DD`) é o único dado pessoal pedido. A idade é derivada a cada
renderização a partir da data atual:

- `calcAge(birth, today)` devolve anos, meses e dias completos (trata 29/02 e virada de ano).
- O app recalcula ao abrir, ao voltar do segundo plano (`AppState`) e a cada minuto, então o filtro
  etário acompanha o tempo sem qualquer ação da usuária.
- Faixas: `9–14`, `15–24`, `25–39`, `40–49`, `50–64`, `65+` (abaixo de 9 anos não há item no catálogo).

A idade serve para **organizar e filtrar**, não para indicar exame. Itens cuja indicação depende de
risco, sintomas ou histórico têm `conditional: true` e aparecem com o selo "Depende de avaliação".

## Catálogo

Cada exame em `src/data/exams.json`:

| Campo | Uso |
| --- | --- |
| `id` | Identificador estável (chave dos registros) |
| `name`, `purpose` | Nome e finalidade em linguagem simples |
| `category` | Uma das categorias em `CATEGORIES` (`src/domain/exams.ts`) |
| `ageMin` / `ageMax` | Faixa de referência em anos (`null` = aberta) |
| `interval`, `intervalMonths` | Periodicidade em texto e, quando fixa, em meses |
| `conditional` | Indicação depende de avaliação profissional |
| `notes` | Ressalvas e limitações |
| `source` | `org`, `title`, `year` da diretriz |
| `lastReviewed` | Data da última revisão do item |

`parseCatalog()` valida o arquivo no boot: id duplicado, categoria desconhecida, faixa invertida ou
fonte ausente quebram a verificação em vez de virarem dado silenciosamente errado.

O catálogo é embutido no app; os dados pessoais ficam apenas no SQLite do aparelho — atualizar o
catálogo não afeta os registros da usuária.

## Persistência local

```sql
profile(id=1, birth_date, created_at)
exam_records(id, exam_id, performed_on, created_at)   -- histórico, vários por exame
```

"Marcado como realizado" = existe ao menos um registro para o exame. Remover o último registro
desmarca. Desinstalar o app apaga tudo (exportação/backup está fora do MVP).

## Como rodar

```bash
npm install
npm start          # Expo Go / dev build
npm run web        # no navegador (armazenamento em localStorage)
npm run android    # ou npm run ios
```

## Verificação

```bash
npm run typecheck  # tsc --noEmit
npm run verify     # 86 checagens de domínio no Node (type stripping, sem jest)
npm run check      # os dois
npm run export:web # smoke test do bundle web
```

A verificação cobre: idade exata (aniversário, virada de ano, 29/02), validação de datas, faixas sem
lacunas, integridade do catálogo, busca sem acento, filtros por idade/categoria/pendentes, resumo e
ordenação das recomendações.

A UI foi verificada no build web (Expo Router + react-native-web) com: onboarding e validação de
data inválida, filtro automático por idade, busca, troca de categoria, deep link para detalhes,
registro com data passada, rejeição de data futura, remoção em duas etapas, recálculo de idade ao
alterar a data de nascimento e o tema claro em tons de rosa. **Não cobre** gestos nativos, layout em aparelhos
específicos nem Expo Go — isso exige teste em dispositivo real.

## Próximos passos (fora do MVP)

1. Validação clínica do catálogo e das faixas etárias por profissional habilitado.
2. Lembretes locais com base em `intervalMonths` e na data do último registro.
3. Exportação/backup do histórico.
4. Atualização do catálogo sem publicar nova versão do app.
5. Sincronização opcional (exige decisão sobre privacidade e consentimento).

## Privacidade

Coleta apenas a data de nascimento, sem nome, e-mail ou localização. Nenhum dado sai do aparelho:
não há rede, telemetria ou analytics no MVP.
