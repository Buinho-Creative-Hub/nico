# Nico · Turmas (alunos, professores e progresso)

> Desde 20 Out 2026 — pedido do Carlos: em computadores partilhados por várias turmas, o progresso
> ficava no computador e passava de um aluno para o seguinte. Modelo inspirado no Tinkercad Classrooms.

## Como funciona (para quem usa)

- **Professor** — `nico.buinho.pt/professor.html` (link «Área do professor» no fundo do ecrã inicial).
  Cria a turma (ex.: «4.º A – Colos») → recebe um **código de 4 letras/números** → junta os alunos
  (um nome por linha; só primeiro nome ou alcunha) → cada aluno recebe um **animal** e uma **senha de
  3 imagens diferentes** → **Imprimir cartões** (recortar e dar a cada aluno).
  Vê o progresso numa tabela alunos × missões (feitos/total e última vez que entrou). Por aluno: nova senha,
  mudar nome, recomeçar (apaga o progresso), apagar. Por turma: mudar nome, arquivar, apagar (pede o código).
- **Aluno** — no ecrã inicial, **Entrar na turma** → escreve o código → carrega no seu nome → carrega nas
  3 imagens pela ordem. Fica com o animal e o nome no topo e o botão **Sair**. O progresso é dele: noutro
  computador, ao entrar, continua onde ia. **Sair** limpa tudo do computador → o próximo aluno começa do zero.
  A sessão acaba sozinha ao fim de 10 h (para o caso de alguém se esquecer de sair).
- **Sem turma** o Nico funciona como antes (progresso guardado no computador). O botão «Entrar na turma» só
  aparece quando o servidor das turmas responde.
- **Sem internet** o aluno com sessão continua a trabalhar; as alterações ficam pendentes (ponto amarelo no
  topo) e seguem sozinhas quando a ligação volta. Para *entrar* na turma é preciso rede.
- **Administrador** (conta inicial, info@buinho.pt): botão **Professores** → criar contas de professor
  (password temporária mostrada no ecrã e enviada por email; troca obrigatória no 1.º acesso).

## Arquitetura

```
GitHub Pages (nico.buinho.pt)          Webtuga / cPanel (nico-api.buinho.pt)
  index.html, palco.html  ── js/turma.js ──►  servidor/api/index.php  (PHP 7.4+/8 + SQLite)
  professor.html          ── js/professor.js ─┘    data/nico.sqlite (ou fora da pasta pública)
```

- A plataforma continua estática no Pages; no servidor só fica a API com a base de dados. Se o servidor
  falhar, o Nico funciona na mesma (offline-first) e sincroniza depois.
- **Chaves**: com sessão, `F.chaveMissao` leva o prefixo `aluno.<CÓDIGO>.<id>.`; `app.js`/`palco-app.js` chamam
  `F.Turma.mudou(CHAVE)` em cada gravação → envio ao fim de 1,5 s (fila em `nico.turma.pendente`).
  Ao entrar e uma vez por visita ao ecrã inicial, `puxar()` traz o que está no servidor (fica o que tiver
  mais desafios feitos). O envio leva um **resumo** (missão, título, feitos, total) que alimenta o painel.
- **API** (`?r=<rota>`, JSON; token no cabeçalho `Authorization: Bearer`): `saude` · `turma/alunos` ·
  `aluno/entrar|progresso|sair` · `prof/entrar|eu|password|esqueci|sair|turmas|turma|turma/criar|turma/editar|
  turma/apagar|alunos/criar|aluno/editar|aluno/apagar|aluno/projeto` · `admin/profs|prof/criar|prof/apagar`.
- **Segurança**: passwords dos professores com `password_hash`; troca obrigatória no 1.º login; recuperação
  por email (resposta neutra, envia sempre para o email registado; `prof/esqueci`) — padrão
  `buinho-os/patterns/auth-backend.md`. Tokens aleatórios guardados com SHA-256; alunos 10 h, professores 12 h.
  Limites de tentativas: aluno 6 / 2 min; professor 8 / 15 min; por IP 40 / 10 min. CORS só para as origens
  configuradas. A senha de imagens do aluno fica legível para o professor (é para lha poder dar) — é uma
  senha de baixo valor, pensada para crianças de 6–10 anos, como nas turmas do Scratch/Tinkercad.
- **Dados pessoais (crianças)**: só primeiro nome/alcunha, animal, senha de imagens, progresso e a data da
  última entrada. Sem apelidos, datas de nascimento, fotos ou emails de alunos. O professor apaga a turma no
  fim do ano letivo (apaga tudo em cascata). Convém uma linha no acordo com cada agrupamento.

## Instalar no servidor (Webtuga, conta cPanel `buinhoed`)

1. **Subdomínio** — cPanel → Domínios → Criar: `nico-api.buinho.pt` (pasta `nico-api.buinho.pt`).
   A zona DNS do buinho.pt está nesta conta, por isso o registo é criado sozinho. Depois **SSL/TLS Status →
   Run AutoSSL** e confirmar o cadeado em `https://nico-api.buinho.pt`.
2. **Ficheiros** — Gestor de ficheiros → pasta do subdomínio → Carregar `Nico-API.zip` → Extrair.
   Confirmar permissões 0644 (ficheiros) / 0755 (pastas).
3. **Configuração** — copiar `config_local.exemplo.php` para `config_local.php` e preencher a password inicial
   do administrador e, de preferência, `db_path` fora da pasta pública (ex.: `/home/buinhoed/nico-dados/nico.sqlite`).
4. **Versão do PHP** — MultiPHP Manager: 8.x para o subdomínio (mínimo 7.4).
5. **Teste** — abrir `https://nico-api.buinho.pt/?r=saude` → `{"ok":true,"versao":"1.0.0","tem_admin":true}`.
6. **Primeiro acesso** — `https://nico.buinho.pt/professor.html` → info@buinho.pt + password inicial →
   escolher password nova → criar a primeira turma. Testar «Esqueci-me da password» (confirma que o email sai).

Atualizar: carregar só `index.php` novo (a base de dados e o `config_local.php` não se tocam).
Cópia de segurança: a do cPanel (diária) apanha o ficheiro `.sqlite`.

## Testes

`node testes/turmas.js` — API PHP local + Nico local: professor (1.º login, turma, alunos), aluno (senha errada,
entrar, progresso na chave própria, envio, sem rede → pendente → rede → envio), sair (computador limpo, próximo
aluno do zero), outro computador (continua onde ia), painel do professor. Precisa de `php` (CLI).
