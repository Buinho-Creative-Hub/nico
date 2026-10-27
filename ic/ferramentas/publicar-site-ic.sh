#!/usr/bin/env bash
# Prepara a versão TESTADA do IC Sensing Lab para o site do projeto (invisiblecartographies.eu/lab/).
#
#   Testes:   https://nico.buinho.pt/ic/   (cada push ao repo nico; é aqui que se experimenta)
#   Produção: https://invisiblecartographies.eu/lab/   (Webtuga, cPanel; só versões testadas)
#
# Uso (na pasta ic/ do repo nico, ou na cópia do buinho-os):
#   ferramentas/publicar-site-ic.sh [pasta-de-saída]
# Gera <saída>/ic-lab-<versão>.zip com UMA pasta lab/ lá dentro. No cPanel: subir o zip para a RAIZ da app do site
# (onde está o app.py), apagar a pasta lab/ antiga, extrair, e fazer Restart. Ver docs/PUBLICAR-NO-SITE-IC.md.
set -euo pipefail
AQUI="$(cd "$(dirname "$0")/.." && pwd)"
SAIDA="$(cd "${1:-.}" && pwd)"
cd "$AQUI"
python3 ferramentas/gerar-sw.py >/dev/null
VERSAO="$(grep -o "Version 0\.[0-9.]*" i18n/educadores.js | head -1 | cut -d' ' -f2)"
COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo sem-git)"
DATA="$(date -u +%Y-%m-%d)"
TMP="$(mktemp -d)"
mkdir -p "$TMP/lab"
# tudo menos o que só serve para desenvolver
tar --exclude=./testes --exclude=./ferramentas --exclude=./docs --exclude='./*.bat' --exclude=./.git -cf - . | tar -xf - -C "$TMP/lab"
printf 'IC Sensing Lab %s\ncommit %s (repo Buinho-Creative-Hub/nico, pasta ic/)\npublicado %s\n' "$VERSAO" "$COMMIT" "$DATA" > "$TMP/lab/VERSAO.txt"
NOME="ic-lab-$VERSAO-$COMMIT.zip"
rm -f "$SAIDA/$NOME"
(cd "$TMP" && zip -qr "$SAIDA/$NOME" lab)
rm -rf "$TMP"
echo "$SAIDA/$NOME"
echo "Depois do upload, confirmar: https://invisiblecartographies.eu/lab/VERSAO.txt → IC Sensing Lab $VERSAO, commit $COMMIT"
