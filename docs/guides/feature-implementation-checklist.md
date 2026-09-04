# Checklist de Implementação de Feature

Use ao adicionar um módulo (célula, patrimônio, agenda…). Cada item é
verificável — nada de "revisei".

## Antes de escrever código

- [ ] Li o contrato do domínio em `project-ccvm/docs/api/contracts/<dominio>.md`
- [ ] Conferi os endpoints **implementados** no controller correspondente
      (contrato e código divergem em alguns pontos — ver `api-integration-guide.md`)
- [ ] Anotei as roles de cada operação (`@PreAuthorize`) e refleti em `permissions.ts`
- [ ] Identifiquei os campos **limpáveis** do update (`Optional<T>` no DTO)
- [ ] Sei a que fase esta feature pertence em `docs/specs/tasks.md`

## Tipos

- [ ] `Summary` (listagem) e detalhe modelados em `shared/types/domain.ts`
- [ ] Enums como union de string literal, iguais ao backend
- [ ] Nenhum request com `churchId`

## Camada de dados

- [ ] `<dominio>.api.ts` com list/getById/create/update/remove conforme o contrato
- [ ] `toQuery` nos filtros, `omitUndefined` nos payloads
- [ ] `<dominio>.queries.ts` com `<dominio>Keys` hierárquicas
- [ ] Mutação invalida `keys.all`

## Telas

- [ ] Listagem segue o esqueleto do `layout-model.md`
- [ ] Quatro estados: carregando, erro, vazio, dados
- [ ] Filtros na query string
- [ ] Formulário com RHF + Zod; `400 VALIDATION_ERROR` distribuído nos campos
- [ ] Exclusão com confirmação, dizendo que é soft delete
- [ ] Enums traduzidos; nada em inglês para o usuário
- [ ] Ações escondidas por `can(...)`

## Navegação

- [ ] Rota em português registrada em `app/router/routes.tsx`
- [ ] Item de menu em `layouts/navigation.ts` (com `permission` se restrito)
- [ ] Rota restrita envolvida em `RequirePermission`

## Testes

- [ ] Handler MSW do domínio
- [ ] Teste da listagem (dados + estado de erro)
- [ ] Teste do recorte por permissão
- [ ] Teste do formulário no caminho de validação
- [ ] `npm run check` verde

## Documentação

- [ ] `docs/specs/tasks.md` atualizado (item marcado)
- [ ] ADR criada se houve decisão relevante
- [ ] Códigos de erro novos adicionados ao mapa de `api-error.ts`
