<?php
/* Nico — API das turmas (PHP 7.4+/8 + SQLite, sem dependências).
 * Só guarda turmas, alunos (alcunha + senha de imagens), progresso e professores.
 * A plataforma continua no GitHub Pages; se esta API falhar, o Nico funciona na mesma e sincroniza depois.
 *
 * Rotas: ?r=<rota>  (GET ou POST com JSON). Ver docs/TURMAS.md.
 * Configuração: config_local.php (NUNCA no repositório) — ver config_local.exemplo.php.
 */
declare(strict_types=1);
const NICO_API_VERSAO = '1.1.0';   // 1.1: plataforma IC Sensing Lab (site do Invisible Cartographies) — origens e emails próprios

$CFG = [
    'db_path'        => __DIR__ . '/data/nico.sqlite',
    'origens'        => ['https://nico.buinho.pt', 'https://buinho-creative-hub.github.io', 'null'],
    'admin_email'    => 'info@buinho.pt',
    'admin_nome'     => 'Buinho',
    'admin_password' => '',                 // password inicial (troca obrigatória no 1.º login)
    'mail_from'      => 'Nico · Buinho <info@buinho.pt>',
    'url_professor'  => 'https://nico.buinho.pt/professor.html',
    // IC Sensing Lab: mesmas contas e turmas; produção no site do projeto, testes em nico.buinho.pt/ic
    'origens_ic'     => ['https://invisiblecartographies.eu', 'https://www.invisiblecartographies.eu'],
    'mail_from_ic'   => 'Invisible Cartographies · Sensing Lab <info@buinho.pt>',
    'url_professor_ic' => 'https://invisiblecartographies.eu/lab/professor.html',
];
if (is_file(__DIR__ . '/config_local.php')) { $CFG = array_merge($CFG, (array) require __DIR__ . '/config_local.php'); }
// as origens do IC juntam-se sempre (mesmo que o config_local.php defina as suas 'origens')
$CFG['origens'] = array_values(array_unique(array_merge((array) $CFG['origens'], (array) $CFG['origens_ic'])));

// ------------------------------------------------------------------ CORS + respostas
$origem = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origem !== '' && in_array($origem, $CFG['origens'], true)) {
    header('Access-Control-Allow-Origin: ' . $origem);
    header('Vary: Origin');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Max-Age: 86400');
}
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') { http_response_code(204); exit; }
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function responder($dados, int $codigo = 200): void { http_response_code($codigo); echo json_encode($dados, JSON_UNESCAPED_UNICODE); exit; }
function erro(string $msg, int $codigo = 400): void { responder(['erro' => $msg], $codigo); }
function entrada(): array {
    static $j = null;
    if ($j === null) { $raw = file_get_contents('php://input') ?: ''; if (strlen($raw) > 2000000) erro('Pedido demasiado grande.', 413); $j = json_decode($raw, true) ?: []; }
    return $j;
}
function campo(string $k, $def = null) { $j = entrada(); return $j[$k] ?? ($_GET[$k] ?? $def); }
function texto(string $k, int $max = 80): string { $v = trim((string) campo($k, '')); return mb_substr(preg_replace('/\s+/u', ' ', $v), 0, $max); }

// ------------------------------------------------------------------ base de dados
function db(): PDO {
    static $pdo = null; global $CFG;
    if ($pdo) return $pdo;
    $dir = dirname($CFG['db_path']);
    if (!is_dir($dir)) { @mkdir($dir, 0755, true); }
    if (!is_file($dir . '/.htaccess')) { @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n"); }
    $pdo = new PDO('sqlite:' . $CFG['db_path'], null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $pdo->exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 4000;');
    $pdo->exec("
      CREATE TABLE IF NOT EXISTS professores (
        id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, nome TEXT NOT NULL DEFAULT '',
        password_hash TEXT NOT NULL, must_change_password INTEGER NOT NULL DEFAULT 1, admin INTEGER NOT NULL DEFAULT 0,
        recovery_email TEXT NOT NULL DEFAULT '', criado TEXT NOT NULL DEFAULT (datetime('now')));
      CREATE TABLE IF NOT EXISTS turmas (
        id INTEGER PRIMARY KEY AUTOINCREMENT, professor_id INTEGER NOT NULL REFERENCES professores(id) ON DELETE CASCADE,
        nome TEXT NOT NULL, codigo TEXT UNIQUE NOT NULL, arquivada INTEGER NOT NULL DEFAULT 0, criada TEXT NOT NULL DEFAULT (datetime('now')));
      CREATE TABLE IF NOT EXISTS alunos (
        id INTEGER PRIMARY KEY AUTOINCREMENT, turma_id INTEGER NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
        nome TEXT NOT NULL, avatar INTEGER NOT NULL DEFAULT 0, senha TEXT NOT NULL, visto TEXT,
        criado TEXT NOT NULL DEFAULT (datetime('now')));
      CREATE TABLE IF NOT EXISTS progresso (
        aluno_id INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE, chave TEXT NOT NULL,
        dados TEXT NOT NULL, resumo TEXT NOT NULL DEFAULT '{}', atualizado TEXT NOT NULL DEFAULT (datetime('now')),
        PRIMARY KEY (aluno_id, chave));
      CREATE TABLE IF NOT EXISTS sessoes (
        token_hash TEXT PRIMARY KEY, tipo TEXT NOT NULL, ref INTEGER NOT NULL, expira INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS tentativas (chave TEXT PRIMARY KEY, n INTEGER NOT NULL, desde INTEGER NOT NULL);
    ");
    // professor-administrador inicial (só se não houver nenhum) — à prova de lockout: vem da configuração
    if ((int) $pdo->query('SELECT COUNT(*) FROM professores')->fetchColumn() === 0 && $CFG['admin_password'] !== '') {
        $st = $pdo->prepare('INSERT INTO professores (email, nome, password_hash, must_change_password, admin, recovery_email) VALUES (?,?,?,1,1,?)');
        $st->execute([strtolower($CFG['admin_email']), $CFG['admin_nome'], password_hash($CFG['admin_password'], PASSWORD_DEFAULT), strtolower($CFG['admin_email'])]);
    }
    return $pdo;
}
function um(string $sql, array $p = []) { $st = db()->prepare($sql); $st->execute($p); return $st->fetch() ?: null; }
function todos(string $sql, array $p = []): array { $st = db()->prepare($sql); $st->execute($p); return $st->fetchAll(); }
function exe(string $sql, array $p = []): int { $st = db()->prepare($sql); $st->execute($p); return $st->rowCount(); }

// ------------------------------------------------------------------ limites de tentativas (por IP / por aluno)
function limite(string $chave, int $max, int $janela): void {
    $agora = time(); $t = um('SELECT n, desde FROM tentativas WHERE chave = ?', [$chave]);
    if ($t && $agora - (int) $t['desde'] < $janela && (int) $t['n'] >= $max) erro('Muitas tentativas. Espera um bocadinho e tenta outra vez.', 429);
}
function falhou(string $chave, int $janela): void {
    $agora = time(); $t = um('SELECT n, desde FROM tentativas WHERE chave = ?', [$chave]);
    if (!$t || $agora - (int) $t['desde'] >= $janela) exe('INSERT OR REPLACE INTO tentativas (chave, n, desde) VALUES (?,1,?)', [$chave, $agora]);
    else exe('UPDATE tentativas SET n = n + 1 WHERE chave = ?', [$chave]);
}
function limpar_tentativas(string $chave): void { exe('DELETE FROM tentativas WHERE chave = ?', [$chave]); }
function ip(): string { return $_SERVER['REMOTE_ADDR'] ?? '?'; }

// ------------------------------------------------------------------ sessões (token no cabeçalho Authorization)
function nova_sessao(string $tipo, int $ref, int $horas): string {
    $tok = bin2hex(random_bytes(24));
    exe('DELETE FROM sessoes WHERE expira < ?', [time()]);
    exe('INSERT INTO sessoes (token_hash, tipo, ref, expira) VALUES (?,?,?,?)', [hash('sha256', $tok), $tipo, $ref, time() + $horas * 3600]);
    return $tok;
}
function token(): string {
    $h = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
    if ($h === '' && function_exists('getallheaders')) { foreach (getallheaders() as $k => $v) if (strtolower($k) === 'authorization') $h = $v; }
    if ($h === '') $h = 'Bearer ' . (string) ($_GET['t'] ?? '');
    return preg_match('/^Bearer\s+([a-f0-9]{48})$/i', trim($h), $m) ? strtolower($m[1]) : '';
}
function sessao(string $tipo): int {
    $t = token(); if ($t === '') erro('Sessão em falta.', 401);
    $s = um('SELECT ref, expira FROM sessoes WHERE token_hash = ? AND tipo = ?', [hash('sha256', $t), $tipo]);
    if (!$s || (int) $s['expira'] < time()) erro('Sessão terminada. Entra outra vez.', 401);
    return (int) $s['ref'];
}
function professor(bool $permitirTroca = false): array {
    $p = um('SELECT id, email, nome, admin, must_change_password FROM professores WHERE id = ?', [sessao('prof')]);
    if (!$p) erro('Conta inexistente.', 401);
    if (!$permitirTroca && (int) $p['must_change_password'] === 1) erro('Tens de mudar a password antes de continuar.', 403);
    return $p;
}
function turma_do_professor(int $turmaId, array $p): array {
    $t = um('SELECT * FROM turmas WHERE id = ?', [$turmaId]);
    if (!$t || ((int) $t['professor_id'] !== (int) $p['id'] && !(int) $p['admin'])) erro('Turma não encontrada.', 404);
    return $t;
}

// ------------------------------------------------------------------ utilitários
const AVATARES = 16;     // os desenhos estão no Nico (js/turma.js) — aqui só o número
const IMAGENS_SENHA = 9;
function codigo_turma(): string {
    $abc = 'ACDEFHJKMNPRTUVWXY3479';     // sem letras/números que se confundem (0/O, 1/I/L, 5/S, 8/B, 2/Z)
    do { $c = ''; for ($i = 0; $i < 4; $i++) $c .= $abc[random_int(0, strlen($abc) - 1)]; } while (um('SELECT 1 FROM turmas WHERE codigo = ?', [$c]));
    return $c;
}
function senha_imagens(): string { $s = []; while (count($s) < 3) { $i = random_int(0, IMAGENS_SENHA - 1); if (!in_array($i, $s, true)) $s[] = $i; } return implode('-', $s); }   // 3 imagens diferentes
function password_temporaria(): string { $abc = 'abcdefghjkmnpqrstuvwxyz23456789'; $p = ''; for ($i = 0; $i < 10; $i++) $p .= $abc[random_int(0, strlen($abc) - 1)]; return $p; }
function enviar_email(string $para, string $assunto, string $corpo, string $de = ''): bool {
    global $CFG;
    $de = $de ?: $CFG['mail_from'];
    $cab = "From: $de\r\nContent-Type: text/plain; charset=UTF-8\r\nMIME-Version: 1.0";
    return @mail($para, '=?UTF-8?B?' . base64_encode($assunto) . '?=', $corpo, $cab);
}
// Emails da plataforma IC Sensing Lab (pedido com plataforma = 'ic'), na língua do professor (en, sr, es, pt).
// O endereço vem SEMPRE da configuração, nunca do pedido (a rota «esqueci» é pública).
function email_ic(string $tipo, string $lingua, array $v): array {
    global $CFG;
    $l = in_array($lingua, ['en', 'sr', 'es', 'pt'], true) ? $lingua : 'en';
    $v['url'] = $CFG['url_professor_ic'];
    $T = [
        'conta' => [
            'en' => ['Invisible Cartographies Sensing Lab · your teacher account', "Hello {nome},\n\nWe created a teacher account for you in the Invisible Cartographies Sensing Lab.\n\nAddress: {url}\nEmail: {email}\nTemporary password: {tmp}\n\nOn your first sign-in you will be asked for a new password.\n\nInvisible Cartographies · Buinho FabLab"],
            'sr' => ['Невидљиве картографије · Сензорна лабораторија · ваш наставнички налог', "Здраво {nome},\n\nНаправили смо вам наставнички налог у Сензорној лабораторији пројекта Невидљиве картографије.\n\nАдреса: {url}\nИмејл: {email}\nПривремена лозинка: {tmp}\n\nПри првој пријави биће затражена нова лозинка.\n\nInvisible Cartographies · Buinho FabLab"],
            'es' => ['Cartografías Invisibles · Laboratorio sensorial · tu cuenta de profesor/a', "Hola {nome}:\n\nTe hemos creado una cuenta de profesor/a en el Laboratorio sensorial de Cartografías Invisibles.\n\nDirección: {url}\nCorreo: {email}\nContraseña temporal: {tmp}\n\nEn el primer acceso te pedirá una contraseña nueva.\n\nInvisible Cartographies · Buinho FabLab"],
            'pt' => ['Cartografias Invisíveis · Laboratório sensorial · a tua conta de professor', "Olá {nome},\n\nCriámos-te uma conta de professor no Laboratório sensorial do Cartografias Invisíveis.\n\nEndereço: {url}\nEmail: {email}\nPassword temporária: {tmp}\n\nNo primeiro acesso vai pedir-te uma password nova.\n\nInvisible Cartographies · Buinho FabLab"],
        ],
        'esqueci' => [
            'en' => ['Invisible Cartographies Sensing Lab · temporary password', "Hello {nome},\n\nYour temporary password for the teacher area is: {tmp}\n\nSign in at {url} — you will be asked for a new password.\n\nIf you did not ask for this, please ignore this email.\n\nInvisible Cartographies · Buinho FabLab"],
            'sr' => ['Невидљиве картографије · привремена лозинка', "Здраво {nome},\n\nВаша привремена лозинка за простор за наставнике је: {tmp}\n\nПријавите се на {url} — биће затражена нова лозинка.\n\nАко ово нисте тражили, занемарите овај имејл.\n\nInvisible Cartographies · Buinho FabLab"],
            'es' => ['Cartografías Invisibles · contraseña temporal', "Hola {nome}:\n\nTu contraseña temporal para el área del profesorado es: {tmp}\n\nEntra en {url}: te pedirá una contraseña nueva.\n\nSi no lo has pedido tú, ignora este correo.\n\nInvisible Cartographies · Buinho FabLab"],
            'pt' => ['Cartografias Invisíveis · password temporária', "Olá {nome},\n\nA tua password temporária da área do professor é: {tmp}\n\nEntra em {url} — vai pedir-te uma password nova.\n\nSe não foste tu a pedir, ignora este email.\n\nInvisible Cartographies · Buinho FabLab"],
        ],
    ];
    [$assunto, $corpo] = $T[$tipo][$l];
    foreach ($v as $k => $x) $corpo = str_replace('{' . $k . '}', (string) $x, $corpo);
    return [$assunto, $corpo];
}
function e_ic(): bool { return campo('plataforma') === 'ic'; }

function resumo_aluno(int $alunoId): array {
    $r = [];
    foreach (todos('SELECT chave, resumo, atualizado FROM progresso WHERE aluno_id = ?', [$alunoId]) as $p) {
        $r[$p['chave']] = (json_decode($p['resumo'], true) ?: []) + ['atualizado' => $p['atualizado']];
    }
    return $r;
}

// ------------------------------------------------------------------ rotas
$rota = trim((string) ($_GET['r'] ?? ''), '/');
try {
switch ($rota) {

case '':
case 'saude':
    responder(['ok' => true, 'versao' => NICO_API_VERSAO, 'tem_admin' => (int) db()->query('SELECT COUNT(*) FROM professores WHERE admin = 1')->fetchColumn() > 0]);

// ---------------- alunos
case 'turma/alunos': {          // código da turma → lista de nomes para o aluno escolher o seu
    limite('ip:' . ip(), 40, 600);
    $cod = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', (string) campo('codigo', '')));
    $t = um('SELECT id, nome FROM turmas WHERE codigo = ? AND arquivada = 0', [$cod]);
    if (!$t) { falhou('ip:' . ip(), 600); erro('Não encontrei essa turma. Confirma o código com o professor.', 404); }
    responder(['turma' => ['nome' => $t['nome'], 'codigo' => $cod],
               'alunos' => todos('SELECT id, nome, avatar FROM alunos WHERE turma_id = ? ORDER BY nome COLLATE NOCASE', [$t['id']])]);
}
case 'aluno/entrar': {
    $cod = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', (string) campo('codigo', '')));
    $id = (int) campo('aluno', 0);
    $senha = implode('-', array_map('intval', (array) campo('senha', [])));
    limite('aluno:' . $id, 6, 120);
    $a = um('SELECT a.id, a.nome, a.avatar, a.senha, t.nome AS turma, t.codigo FROM alunos a JOIN turmas t ON t.id = a.turma_id WHERE a.id = ? AND t.codigo = ? AND t.arquivada = 0', [$id, $cod]);
    if (!$a || !hash_equals($a['senha'], $senha)) { falhou('aluno:' . $id, 120); erro('Essa não é a tua senha. Tenta outra vez!', 401); }
    limpar_tentativas('aluno:' . $id);
    exe("UPDATE alunos SET visto = datetime('now') WHERE id = ?", [$id]);
    responder(['token' => nova_sessao('aluno', (int) $a['id'], 10),
               'aluno' => ['id' => (int) $a['id'], 'nome' => $a['nome'], 'avatar' => (int) $a['avatar']],
               'turma' => ['nome' => $a['turma'], 'codigo' => $a['codigo']]]);
}
case 'aluno/progresso': {
    $id = sessao('aluno');
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $itens = (array) campo('itens', []);
        foreach (array_slice($itens, 0, 40) as $it) {
            $chave = (string) ($it['chave'] ?? '');
            if (!preg_match('/^[a-z0-9._-]{1,80}$/i', $chave)) continue;
            $dados = json_encode($it['dados'] ?? null, JSON_UNESCAPED_UNICODE);
            $resumo = json_encode((array) ($it['resumo'] ?? []), JSON_UNESCAPED_UNICODE);
            if (strlen($dados) > 400000 || strlen($resumo) > 4000) continue;
            exe("INSERT INTO progresso (aluno_id, chave, dados, resumo, atualizado) VALUES (?,?,?,?,datetime('now'))
                 ON CONFLICT(aluno_id, chave) DO UPDATE SET dados = excluded.dados, resumo = excluded.resumo, atualizado = excluded.atualizado",
                [$id, $chave, $dados, $resumo]);
        }
        exe("UPDATE alunos SET visto = datetime('now') WHERE id = ?", [$id]);
        responder(['ok' => true]);
    }
    $itens = [];
    foreach (todos('SELECT chave, dados, atualizado FROM progresso WHERE aluno_id = ?', [$id]) as $p) {
        $itens[$p['chave']] = ['dados' => json_decode($p['dados'], true), 'atualizado' => $p['atualizado']];
    }
    responder(['itens' => (object) $itens]);
}
case 'aluno/sair':
    $t = token(); if ($t !== '') exe('DELETE FROM sessoes WHERE token_hash = ?', [hash('sha256', $t)]);
    responder(['ok' => true]);

// ---------------- professores: conta
case 'prof/entrar': {
    $email = strtolower(texto('email', 120)); $pw = (string) campo('password', '');
    limite('prof:' . $email, 8, 900); limite('ip:' . ip(), 40, 600);
    $p = um('SELECT * FROM professores WHERE email = ?', [$email]);
    if (!$p || !password_verify($pw, $p['password_hash'])) { falhou('prof:' . $email, 900); falhou('ip:' . ip(), 600); erro('Email ou password errados.', 401); }
    limpar_tentativas('prof:' . $email);
    responder(['token' => nova_sessao('prof', (int) $p['id'], 12), 'nome' => $p['nome'], 'email' => $p['email'],
               'admin' => (int) $p['admin'] === 1, 'must_change_password' => (int) $p['must_change_password'] === 1]);
}
case 'prof/eu': { $p = professor(true); responder(['nome' => $p['nome'], 'email' => $p['email'], 'admin' => (int) $p['admin'] === 1, 'must_change_password' => (int) $p['must_change_password'] === 1]); }
case 'prof/password': {
    $p = professor(true);
    $nova = (string) campo('nova', '');
    if (mb_strlen($nova) < 8) erro('A password nova tem de ter pelo menos 8 caracteres.');
    $atual = um('SELECT password_hash, must_change_password FROM professores WHERE id = ?', [$p['id']]);
    if ((int) $atual['must_change_password'] === 0 && !password_verify((string) campo('atual', ''), $atual['password_hash'])) erro('A password atual não está certa.', 401);
    exe('UPDATE professores SET password_hash = ?, must_change_password = 0 WHERE id = ?', [password_hash($nova, PASSWORD_DEFAULT), $p['id']]);
    responder(['ok' => true]);
}
case 'prof/esqueci': {      // resposta sempre igual (não revela se a conta existe); envia sempre para o email registado
    $email = strtolower(texto('email', 120));
    limite('esqueci:' . ip(), 5, 3600); falhou('esqueci:' . ip(), 3600);
    $p = um('SELECT id, nome, email, recovery_email FROM professores WHERE email = ?', [$email]);
    if ($p) {
        $tmp = password_temporaria();
        exe('UPDATE professores SET password_hash = ?, must_change_password = 1 WHERE id = ?', [password_hash($tmp, PASSWORD_DEFAULT), $p['id']]);
        if (e_ic()) {
            [$a, $c] = email_ic('esqueci', (string) campo('lingua', 'en'), ['nome' => $p['nome'], 'tmp' => $tmp]);
            enviar_email($p['recovery_email'] ?: $p['email'], $a, $c, $CFG['mail_from_ic']);
        } else {
            enviar_email($p['recovery_email'] ?: $p['email'], 'Nico · password temporária',
                "Olá {$p['nome']},\n\nA tua password temporária da área do professor do Nico é: $tmp\n\nEntra em {$CFG['url_professor']} — vai pedir-te uma password nova.\n\nSe não foste tu a pedir, ignora este email.\n\nBuinho Educativo");
        }
    }
    responder(['ok' => true, 'mensagem' => 'Se o email estiver registado, vais receber uma password temporária.']);
}
case 'prof/sair':
    $t = token(); if ($t !== '') exe('DELETE FROM sessoes WHERE token_hash = ?', [hash('sha256', $t)]);
    responder(['ok' => true]);

// ---------------- professores: turmas e alunos
case 'prof/turmas': {
    $p = professor();
    $sql = 'SELECT t.id, t.nome, t.codigo, t.arquivada, t.criada, p.nome AS professor, (SELECT COUNT(*) FROM alunos a WHERE a.turma_id = t.id) AS n_alunos
            FROM turmas t JOIN professores p ON p.id = t.professor_id ' . ((int) $p['admin'] ? '' : 'WHERE t.professor_id = ? ') . 'ORDER BY t.arquivada, t.criada DESC';
    responder(['turmas' => todos($sql, (int) $p['admin'] ? [] : [$p['id']])]);
}
case 'prof/turma/criar': {
    $p = professor(); $nome = texto('nome', 60);
    if ($nome === '') erro('Dá um nome à turma (ex.: 4.º A – Colos).');
    exe('INSERT INTO turmas (professor_id, nome, codigo) VALUES (?,?,?)', [$p['id'], $nome, $cod = codigo_turma()]);
    responder(['id' => (int) db()->lastInsertId(), 'codigo' => $cod]);
}
case 'prof/turma': {
    $p = professor(); $t = turma_do_professor((int) campo('id', 0), $p);
    $alunos = todos('SELECT id, nome, avatar, senha, visto FROM alunos WHERE turma_id = ? ORDER BY nome COLLATE NOCASE', [$t['id']]);
    foreach ($alunos as &$a) { $a['senha'] = array_map('intval', explode('-', $a['senha'])); $a['progresso'] = (object) resumo_aluno((int) $a['id']); }
    responder(['turma' => ['id' => (int) $t['id'], 'nome' => $t['nome'], 'codigo' => $t['codigo'], 'arquivada' => (int) $t['arquivada'] === 1], 'alunos' => $alunos]);
}
case 'prof/turma/editar': {
    $p = professor(); $t = turma_do_professor((int) campo('id', 0), $p);
    if (campo('nome') !== null && texto('nome', 60) !== '') exe('UPDATE turmas SET nome = ? WHERE id = ?', [texto('nome', 60), $t['id']]);
    if (campo('arquivada') !== null) exe('UPDATE turmas SET arquivada = ? WHERE id = ?', [campo('arquivada') ? 1 : 0, $t['id']]);
    responder(['ok' => true]);
}
case 'prof/turma/apagar': {
    $p = professor(); $t = turma_do_professor((int) campo('id', 0), $p);
    if (strtoupper((string) campo('confirmar', '')) !== $t['codigo']) erro('Para apagar, escreve o código da turma.');
    exe('DELETE FROM turmas WHERE id = ?', [$t['id']]);
    responder(['ok' => true]);
}
case 'prof/alunos/criar': {
    $p = professor(); $t = turma_do_professor((int) campo('turma', 0), $p);
    $nomes = array_values(array_filter(array_map(fn($n) => mb_substr(trim(preg_replace('/\s+/u', ' ', (string) $n)), 0, 30), (array) campo('nomes', []))));
    if (!$nomes) erro('Escreve pelo menos um nome.');
    if (count($nomes) > 60) erro('No máximo 60 alunos de cada vez.');
    $usados = array_map('intval', array_column(todos('SELECT avatar FROM alunos WHERE turma_id = ?', [$t['id']]), 'avatar'));
    foreach ($nomes as $i => $n) {
        $livres = array_values(array_diff(range(0, AVATARES - 1), $usados)) ?: range(0, AVATARES - 1);
        $av = $livres[random_int(0, count($livres) - 1)]; $usados[] = $av;
        exe('INSERT INTO alunos (turma_id, nome, avatar, senha) VALUES (?,?,?,?)', [$t['id'], $n, $av, senha_imagens()]);
    }
    responder(['ok' => true, 'criados' => count($nomes)]);
}
case 'prof/aluno/editar': {
    $p = professor();
    $a = um('SELECT * FROM alunos WHERE id = ?', [(int) campo('id', 0)]); if (!$a) erro('Aluno não encontrado.', 404);
    turma_do_professor((int) $a['turma_id'], $p);
    if (texto('nome', 30) !== '') exe('UPDATE alunos SET nome = ? WHERE id = ?', [texto('nome', 30), $a['id']]);
    if (campo('nova_senha')) { exe('UPDATE alunos SET senha = ? WHERE id = ?', [senha_imagens(), $a['id']]); limpar_tentativas('aluno:' . $a['id']); }
    if (campo('recomecar')) exe('DELETE FROM progresso WHERE aluno_id = ?', [$a['id']]);
    responder(['ok' => true]);
}
case 'prof/aluno/apagar': {
    $p = professor();
    $a = um('SELECT * FROM alunos WHERE id = ?', [(int) campo('id', 0)]); if (!$a) erro('Aluno não encontrado.', 404);
    turma_do_professor((int) $a['turma_id'], $p);
    exe('DELETE FROM alunos WHERE id = ?', [$a['id']]);
    responder(['ok' => true]);
}
case 'prof/aluno/projeto': {     // o professor abre o trabalho de um aluno (ex.: o programa do modo livre)
    $p = professor();
    $a = um('SELECT * FROM alunos WHERE id = ?', [(int) campo('id', 0)]); if (!$a) erro('Aluno não encontrado.', 404);
    turma_do_professor((int) $a['turma_id'], $p);
    $pr = um('SELECT dados FROM progresso WHERE aluno_id = ? AND chave = ?', [$a['id'], (string) campo('chave', '')]);
    responder(['dados' => $pr ? json_decode($pr['dados'], true) : null]);
}

// ---------------- administrador: professores
case 'admin/profs': {
    $p = professor(); if (!(int) $p['admin']) erro('Só para o administrador.', 403);
    responder(['profs' => todos('SELECT id, email, nome, admin, must_change_password, criado, (SELECT COUNT(*) FROM turmas t WHERE t.professor_id = professores.id) AS n_turmas FROM professores ORDER BY nome COLLATE NOCASE')]);
}
case 'admin/prof/criar': {
    $p = professor(); if (!(int) $p['admin']) erro('Só para o administrador.', 403);
    $email = strtolower(texto('email', 120)); $nome = texto('nome', 60);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) erro('Email inválido.');
    if (um('SELECT 1 FROM professores WHERE email = ?', [$email])) erro('Já existe uma conta com esse email.');
    $tmp = password_temporaria();
    exe('INSERT INTO professores (email, nome, password_hash, must_change_password, admin, recovery_email) VALUES (?,?,?,1,?,?)',
        [$email, $nome ?: $email, password_hash($tmp, PASSWORD_DEFAULT), campo('admin') ? 1 : 0, $email]);
    if (e_ic()) {
        [$a, $c] = email_ic('conta', (string) campo('lingua', 'en'), ['nome' => $nome ?: $email, 'email' => $email, 'tmp' => $tmp]);
        $enviado = enviar_email($email, $a, $c, $CFG['mail_from_ic']);
    } else {
        $enviado = enviar_email($email, 'Nico · a tua conta de professor',
            "Olá $nome,\n\nCriámos-te uma conta na área do professor do Nico (Buinho Educativo).\n\nEndereço: {$CFG['url_professor']}\nEmail: $email\nPassword temporária: $tmp\n\nNo primeiro acesso vai pedir-te uma password nova.\n\nBuinho Educativo");
    }
    responder(['ok' => true, 'password_temporaria' => $tmp, 'email_enviado' => $enviado]);
}
case 'admin/prof/apagar': {
    $p = professor(); if (!(int) $p['admin']) erro('Só para o administrador.', 403);
    $id = (int) campo('id', 0); if ($id === (int) $p['id']) erro('Não podes apagar a tua própria conta.');
    exe('DELETE FROM professores WHERE id = ?', [$id]);
    responder(['ok' => true]);
}

default: erro('Rota desconhecida.', 404);
}
} catch (Throwable $e) {
    error_log('[nico-api] ' . $e->getMessage());
    erro('Erro no servidor. Tenta outra vez daqui a pouco.', 500);
}
