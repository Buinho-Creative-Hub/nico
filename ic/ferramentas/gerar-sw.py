#!/usr/bin/env python3
"""Gera sw.js (service worker) com a lista de todos os ficheiros do IC Sensing Lab, para funcionar sem internet.
Correr antes de cada publicação:  python3 ferramentas/gerar-sw.py
A versão é um resumo do conteúdo: se algum ficheiro mudar, os browsers apanham a versão nova."""
import hashlib, json, os, pathlib
RAIZ = pathlib.Path(__file__).resolve().parent.parent
FORA_PASTAS = {'.git', 'docs', 'testes', 'microbit', 'ferramentas', 'servidor'}
FORA_FICH = {'sw.js', 'LICENSE', 'CNAME', '.gitignore', '.nojekyll'}
lista, h = [], hashlib.sha256()
for p in sorted(RAIZ.rglob('*')):
    rel = p.relative_to(RAIZ)
    if not p.is_file() or rel.parts[0] in FORA_PASTAS or p.name in FORA_FICH or p.suffix in ('.md', '.bat'):
        continue
    lista.append(rel.as_posix()); h.update(rel.as_posix().encode()); h.update(p.read_bytes())
versao = h.hexdigest()[:10]
modelo = (RAIZ / 'ferramentas' / 'sw-modelo.js').read_text(encoding='utf-8')
out = modelo.replace('__VERSAO__', versao).replace('__FICHEIROS__', json.dumps(['./'] + lista, indent=1, ensure_ascii=False))
(RAIZ / 'sw.js').write_text(out, encoding='utf-8')
print(f'sw.js: {len(lista)} ficheiros, versão {versao}')
