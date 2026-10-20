"""Mascotes PROVISÓRIAS do IC Sensing Lab (Lio, o morcego · Mo, a toupeira) — SVG simples, para o motor funcionar
enquanto o Ambrósio não entrega a identidade final (handoff 2026-10-20_pacheco_ambrosio_ic-identidade-plataforma).
Gera img/lio/*.svg e img/mo/*.svg (8 estados cada). Correr: python3 ferramentas/mascotes-provisorias.py
"""
import os
RAIZ = os.path.join(os.path.dirname(__file__), '..', 'img')
ESTADOS = ['01_boas_vindas', '02_curiosa', '03_a_pensar', '04_surpreendida', '05_a_dar_uma_dica', '06_a_celebrar', '07_a_incentivar', '08_calma']
TINTA = '#13233A'; AZUL = '#3BA6DC'; VERDE = '#1B6E63'; LARANJA = '#E8624A'; PAPEL = '#FAF8F3'; AREIA = '#E7DCC6'

def olhos(e, x1, x2, y, cor_iris=TINTA):
    if e in ('06_a_celebrar',):   # ^ ^
        return f'<path d="M{x1-7} {y+3} q7 -9 14 0 M{x2-7} {y+3} q7 -9 14 0" stroke="{TINTA}" stroke-width="4" fill="none" stroke-linecap="round"/>'
    if e == '08_calma':           # fechados, tranquilos
        return f'<path d="M{x1-7} {y} q7 6 14 0 M{x2-7} {y} q7 6 14 0" stroke="{TINTA}" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
    r = 9 if e == '04_surpreendida' else 7.5
    dy = -3 if e == '03_a_pensar' else 0
    dx = 2 if e == '03_a_pensar' else 0
    s = f'<circle cx="{x1}" cy="{y}" r="{r+3}" fill="#fff"/><circle cx="{x2}" cy="{y}" r="{r+3}" fill="#fff"/>'
    s += f'<circle cx="{x1+dx}" cy="{y+dy}" r="{r-1}" fill="{cor_iris}"/><circle cx="{x2+dx}" cy="{y+dy}" r="{r-1}" fill="{cor_iris}"/>'
    s += f'<circle cx="{x1+dx+2.5}" cy="{y+dy-2.5}" r="2.2" fill="#fff"/><circle cx="{x2+dx+2.5}" cy="{y+dy-2.5}" r="2.2" fill="#fff"/>'
    if e == '02_curiosa':
        s += f'<path d="M{x1-9} {y-16} q8 -6 16 -1" stroke="{TINTA}" stroke-width="3" fill="none" stroke-linecap="round"/>'
    return s

def boca(e, cx, y):
    if e == '04_surpreendida': return f'<ellipse cx="{cx}" cy="{y+3}" rx="6" ry="7.5" fill="{TINTA}"/>'
    if e in ('01_boas_vindas', '06_a_celebrar'):
        return f'<path d="M{cx-12} {y} q12 16 24 0 z" fill="{TINTA}"/><path d="M{cx-6} {y+6} q6 5 12 0" fill="{LARANJA}"/>'
    if e == '03_a_pensar': return f'<path d="M{cx-6} {y+3} h12" stroke="{TINTA}" stroke-width="3.5" stroke-linecap="round"/>'
    if e == '08_calma': return f'<path d="M{cx-7} {y+1} q7 6 14 0" stroke="{TINTA}" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
    return f'<path d="M{cx-10} {y} q10 11 20 0" stroke="{TINTA}" stroke-width="3.8" fill="none" stroke-linecap="round"/>'

def extras(e):
    if e == '02_curiosa': return f'<text x="160" y="52" font-family="Roboto Slab, serif" font-weight="700" font-size="40" fill="{AZUL}">?</text>'
    if e == '04_surpreendida': return f'<text x="162" y="54" font-family="Roboto Slab, serif" font-weight="700" font-size="42" fill="{LARANJA}">!</text>'
    if e == '03_a_pensar': return f'<circle cx="158" cy="48" r="5" fill="{AZUL}"/><circle cx="170" cy="34" r="7" fill="{AZUL}"/><circle cx="184" cy="18" r="9" fill="{AZUL}"/>'
    if e == '06_a_celebrar':
        return ''.join(f'<rect x="{x}" y="{y}" width="7" height="7" rx="1.5" fill="{c}" transform="rotate({r} {x} {y})"/>' for x, y, c, r in
                       [(24, 30, AZUL, 20), (170, 26, LARANJA, -15), (40, 12, VERDE, 40), (150, 10, AZUL, 10), (184, 60, VERDE, 30), (12, 64, LARANJA, -30)])
    if e == '07_a_incentivar': return f'<path d="M168 22 l5 12 12 5 -12 5 -5 12 -5 -12 -12 -5 12 -5z" fill="{LARANJA}"/>'
    if e == '05_a_dar_uma_dica': return f'<path d="M170 28 a14 14 0 1 1 0.1 0 z" fill="#FFD25A"/><rect x="164" y="54" width="13" height="8" rx="2" fill="{TINTA}"/>'
    if e == '08_calma': return f'<path d="M150 40 q10 -8 20 0 t20 0 M148 56 q10 -8 20 0 t20 0" stroke="{AZUL}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>'
    return ''

def contornos(cx, cy, cor):   # curvas de nível do IC no lenço
    return ''.join(f'<ellipse cx="{cx}" cy="{cy}" rx="{6+i*6}" ry="{3+i*3}" fill="none" stroke="{cor}" stroke-width="1.6" opacity=".55"/>' for i in range(3))

def abafadores(cx, y, larg):
    return (f'<path d="M{cx-larg} {y} q{larg} -{larg*1.25} {larg*2} 0" stroke="{VERDE}" stroke-width="7" fill="none" stroke-linecap="round"/>'
            f'<rect x="{cx-larg-11}" y="{y-6}" width="18" height="26" rx="8" fill="{VERDE}"/><rect x="{cx+larg-7}" y="{y-6}" width="18" height="26" rx="8" fill="{VERDE}"/>')

def lio(e):  # morcego: corpo cinza-azulado, orelhas grandes, asas
    C = '#4E6A8F'; CB = '#C9D8E8'; ASA = '#3A5274'
    s = ''
    # asas (posição muda com o estado)
    if e == '06_a_celebrar':
        s += f'<path d="M62 120 L10 60 L28 92 L8 96 L34 118 L22 132 Z" fill="{ASA}"/><path d="M138 120 L190 60 L172 92 L192 96 L166 118 L178 132 Z" fill="{ASA}"/>'
    elif e == '01_boas_vindas':
        s += f'<path d="M62 130 L18 150 L34 132 L16 124 L58 112 Z" fill="{ASA}"/><path d="M138 118 L182 66 L172 96 L194 98 L150 132 Z" fill="{ASA}"/>'
    elif e == '05_a_dar_uma_dica':
        s += f'<path d="M62 130 L18 150 L34 132 L16 124 L58 112 Z" fill="{ASA}"/><path d="M140 124 L196 108 L180 122 L198 132 L146 140 Z" fill="{ASA}"/>'
    elif e == '03_a_pensar':
        s += f'<path d="M62 130 L18 150 L34 132 L16 124 L58 112 Z" fill="{ASA}"/><path d="M136 128 Q150 112 128 104 L120 112 Z" fill="{ASA}"/>'
    else:
        s += f'<path d="M62 130 L18 150 L34 132 L16 124 L58 112 Z" fill="{ASA}"/><path d="M138 130 L182 150 L166 132 L184 124 L142 112 Z" fill="{ASA}"/>'
    # corpo
    s += f'<ellipse cx="100" cy="140" rx="42" ry="44" fill="{C}"/><ellipse cx="100" cy="150" rx="26" ry="28" fill="{CB}"/>'
    # pés
    s += f'<ellipse cx="84" cy="184" rx="11" ry="6" fill="{ASA}"/><ellipse cx="116" cy="184" rx="11" ry="6" fill="{ASA}"/>'
    # cabeça
    s += f'<path d="M58 70 L50 18 L86 52 Z" fill="{C}"/><path d="M142 70 L150 18 L114 52 Z" fill="{C}"/>'
    s += f'<path d="M62 62 L57 30 L80 52 Z" fill="#E7A9A0"/><path d="M138 62 L143 30 L120 52 Z" fill="#E7A9A0"/>'
    s += f'<circle cx="100" cy="82" r="42" fill="{C}"/>'
    s += f'<ellipse cx="100" cy="96" rx="26" ry="18" fill="{CB}"/>'
    s += olhos(e, 84, 116, 78)
    s += f'<path d="M95 92 q5 4 10 0 l-5 5z" fill="{TINTA}"/>'
    s += boca(e, 100, 103)
    s += f'<path d="M96 104 l2 5 2 -5" fill="#fff"/>' if e not in ('04_surpreendida',) else ''
    # lenço com curvas de nível + micro:bit ao peito
    s += f'<path d="M66 116 q34 18 68 0 l-4 12 q-30 14 -60 0z" fill="{LARANJA}"/>' + contornos(100, 124, '#fff')
    s += f'<rect x="88" y="140" width="24" height="18" rx="3" fill="{TINTA}"/><rect x="92" y="144" width="4" height="4" fill="#E8624A"/><rect x="104" y="144" width="4" height="4" fill="#E8624A"/><rect x="96" y="151" width="8" height="2" fill="#E8624A"/>'
    if e == '08_calma': s += abafadores(100, 72, 40)
    s += f'<ellipse cx="74" cy="96" rx="6" ry="4" fill="#E7A9A0" opacity=".7"/><ellipse cx="126" cy="96" rx="6" ry="4" fill="#E7A9A0" opacity=".7"/>'
    if e == '02_curiosa': s = f'<g transform="rotate(-7 100 110)">{s}</g>'
    return s

def mo(e):  # toupeira: corpo castanho-quente, focinho cor-de-rosa, mãos grandes de escavar
    C = '#8A6A55'; CB = AREIA; MAO = '#F0B7A4'
    s = ''
    s += f'<ellipse cx="100" cy="132" rx="50" ry="52" fill="{C}"/><ellipse cx="100" cy="146" rx="32" ry="32" fill="{CB}"/>'
    s += f'<ellipse cx="80" cy="184" rx="13" ry="6" fill="{MAO}"/><ellipse cx="120" cy="184" rx="13" ry="6" fill="{MAO}"/>'
    # mãos
    def mao(x, y, r=0):
        return f'<g transform="rotate({r} {x} {y})"><ellipse cx="{x}" cy="{y}" rx="16" ry="13" fill="{MAO}"/>' + ''.join(
            f'<path d="M{x-10+i*7} {y-10} l2 -9" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' for i in range(4)) + '</g>'
    if e == '06_a_celebrar': s += mao(40, 62, -30) + mao(160, 62, 30)
    elif e == '01_boas_vindas': s += mao(56, 138, 20) + mao(162, 70, 20)
    elif e == '05_a_dar_uma_dica': s += mao(56, 138, 20) + mao(176, 116, 80)
    elif e == '03_a_pensar': s += mao(56, 138, 20) + mao(118, 112, -10)
    elif e == '07_a_incentivar': s += mao(56, 138, 20) + mao(150, 120, -20)
    else: s += mao(56, 138, 20) + mao(144, 138, -20)
    # cabeça (redonda, sem orelhas visíveis), focinho comprido
    s += f'<circle cx="100" cy="76" r="44" fill="{C}"/>'
    s += f'<ellipse cx="100" cy="98" rx="20" ry="15" fill="{CB}"/>'
    s += olhos(e, 82, 118, 70)
    s += f'<ellipse cx="100" cy="90" rx="10" ry="8" fill="{MAO}"/><ellipse cx="96" cy="89" rx="2" ry="1.6" fill="{TINTA}"/><ellipse cx="104" cy="89" rx="2" ry="1.6" fill="{TINTA}"/>'
    s += f'<path d="M72 92 l-16 -2 M72 96 l-16 4 M128 92 l16 -2 M128 96 l16 4" stroke="{TINTA}" stroke-width="1.8" stroke-linecap="round" opacity=".6"/>'
    s += boca(e, 100, 104)
    s += f'<path d="M58 116 q42 22 84 0 l-4 13 q-38 18 -76 0z" fill="{VERDE}"/>' + contornos(100, 126, '#fff')
    s += f'<ellipse cx="72" cy="84" rx="6" ry="4" fill="#E7A9A0" opacity=".7"/><ellipse cx="128" cy="84" rx="6" ry="4" fill="#E7A9A0" opacity=".7"/>'
    if e == '08_calma': s += abafadores(100, 64, 44).replace(VERDE, AZUL)
    if e == '02_curiosa': s = f'<g transform="rotate(6 100 110)">{s}</g>'
    return s

for nome, f in (('lio', lio), ('mo', mo)):
    for e in ESTADOS:
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">{f(e)}{extras(e)}</svg>'
        open(os.path.join(RAIZ, nome, e + '.svg'), 'w').write(svg)
print('ok')
