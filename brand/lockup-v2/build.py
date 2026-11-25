"""Builds improved lockups from David's lockup-david-v1.svg. His file is not changed."""
import re, os
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, '..', 'lockup-david-v1.svg')).read()
paths = re.findall(r'<path[^>]*?\sd="([^"]+)"', src)
assert len(paths) == 14, len(paths)
fills, rings, eyes, body = paths[0:5], paths[5:10], paths[11:13], paths[13]
PINK, MAUVE, WHITE, CREAM = '#FFABDA', '#9F527C', '#FFFFFF', '#FFF6EE'
EYE_SHIFT = (-64, 52)          # eyes nudged towards the word

def mark(eye=WHITE, bodyc=MAUVE):
    e = ''.join(f'<path d="{d}" fill="{eye}"/>' for d in eyes)
    return f'<path d="{body}" fill="{bodyc}"/><g transform="translate({EYE_SHIFT[0]} {EYE_SHIFT[1]})">{e}</g>'

def word(style):
    # fills order: p, o, o, c, s
    if style == 'outlined':
        cols = [PINK, WHITE, WHITE, PINK, PINK]
        return ''.join(f'<path d="{d}" fill="{MAUVE}"/>' for d in rings) + \
               ''.join(f'<path d="{d}" fill="{c}"/>' for d, c in zip(fills, cols))
    return ''.join(f'<path d="{d}" fill="{style}"/>' for d in fills)

def place(inner, box, s, right=None, top=None, left=None):
    x0, y0, x1, y1 = box
    if right is not None: tx = right - x1 * s
    else: tx = left - x0 * s
    ty = top - y0 * s
    nb = (x0*s+tx, y0*s+ty, x1*s+tx, y1*s+ty)
    return f'<g transform="translate({tx:.1f} {ty:.1f}) scale({s})">{inner}</g>', nb

def svg(content, boxes, pad, bg):
    x0 = min(b[0] for b in boxes) - pad; y0 = min(b[1] for b in boxes) - pad
    x1 = max(b[2] for b in boxes) + pad; y1 = max(b[3] for b in boxes) + pad
    w, h = x1 - x0, y1 - y0
    r = f'<rect x="{x0:.0f}" y="{y0:.0f}" width="{w:.0f}" height="{h:.0f}" fill="{bg}"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.0f} {y0:.0f} {w:.0f} {h:.0f}" fill="none">{r}{content}</svg>\n'

MARK = (1787, 273, 3240, 1723)
RING = (847, 1244, 2283, 1732)     # word with its outline
FILL = (910, 1307, 2220, 1669)     # word, letters only
out = {}

# 1 Tidy: same design, bigger word, no halo stroke, eyes nudged, even margins
for name, bg in (('tidy', PINK), ('tidy-on-cream', CREAM)):
    w, wb = place(word('outlined'), RING, 1.25, right=2340, top=1180)
    out[name] = svg(w + mark(), [MARK, wb], 190, bg)

# 2 Solid: same layout, letters in solid mauve with no outline
for name, bg in (('solid', PINK), ('solid-on-cream', CREAM)):
    w, wb = place(word(MAUVE), FILL, 1.45, right=2325, top=1205)
    out[name] = svg(w + mark(), [MARK, wb], 190, bg)

# 3 Row: word and mark side by side, for headers and small sizes
for name, bg in (('row', PINK), ('row-on-cream', CREAM)):
    s = 2.3
    w, wb = place(word(MAUVE), FILL, s, right=1640, top=998 - 131 * s)
    out[name] = svg(w + mark(), [MARK, wb], 190, bg)

# Tidy row and Tidy wordmark: the outlined name with white o's, for general use
for name, bg in (('tidy-row', PINK), ('tidy-row-on-cream', CREAM)):
    s = 2.05
    w, wb = place(word('outlined'), RING, s, right=1650, top=998 - 194 * s)
    out[name] = svg(w + mark(), [MARK, wb], 190, bg)
for name, bg in (('tidy-wordmark', PINK), ('tidy-wordmark-on-cream', CREAM)):
    out[name] = svg(word('outlined'), [RING], 150, bg)

# 5 Wordmark: the name alone
for name, bg in (('wordmark', PINK), ('wordmark-on-cream', CREAM)):
    out[name] = svg(word(MAUVE), [FILL], 150, bg)

# 4 Icon: the character alone
cx, cy = 2560, 960
half = 1000
icon = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{cx-half} {cy-half} {2*half} {2*half}" fill="none"><rect x="{cx-half}" y="{cy-half}" width="{2*half}" height="{2*half}" rx="440" fill="{PINK}"/>{mark()}</svg>\n'
out['icon'] = icon

# Transparent copies: the pink versions without the background
for k in [k for k in out if not k.endswith('-on-cream') and k != 'icon']:
    out[k + '-transparent'] = re.sub(r'<rect[^>]*/>', '', out[k], count=1)
out['mark-transparent'] = svg(mark(), [MARK], 60, None)

for k, v in out.items():
    open(os.path.join(here, f'scoop-lockup-{k}.svg'), 'w').write(v)

rows = ''
def sec(title, note, key, sizes=(320, 160, 80)):
    small = ''.join(f'<img style="width:{w}px" src="scoop-lockup-{key}.svg">' for w in sizes)
    return f'''<section><h2>{title}</h2><p>{note}</p>
    <div class="big"><img src="scoop-lockup-{key}.svg"><img src="scoop-lockup-{key}-on-cream.svg"></div>
    <div class="small">{small}</div></section>'''
rows += '<h1>Tidy: the main style</h1>'
rows += sec('Tidy', 'The main logo. Outlined name with white o\'s, tucked into the notch.', 'tidy')
rows += sec('Tidy row', 'Name and character side by side, for site headers.', 'tidy-row')
rows += sec('Tidy wordmark', 'The outlined name alone.', 'tidy-wordmark', (320, 160, 80, 48))
rows += '<h1>Solid: where the outline cannot be used</h1>'
rows += sec('Solid', 'Same layout, letters in solid mauve.', 'solid')
rows += sec('Solid row', 'Side by side, in solid mauve.', 'row')
rows += sec('Solid wordmark', 'The name alone, in solid mauve.', 'wordmark', (320, 160, 80, 48))
rows += '''<h1>Icon</h1><section><p>The character alone, for the app icon, extension button and favicon.</p>
<div class="small"><img style="width:256px" src="scoop-lockup-icon.svg"><img style="width:128px" src="scoop-lockup-icon.svg"><img style="width:64px" src="scoop-lockup-icon.svg"><img style="width:32px" src="scoop-lockup-icon.svg"><img style="width:16px" src="scoop-lockup-icon.svg"></div></section>'''
open(os.path.join(here, 'sheet.html'), 'w').write(f'''<!doctype html><meta charset="utf-8"><style>
body{{margin:0;padding:40px;background:#fff;font:16px/1.4 -apple-system,sans-serif;color:#2B1721;width:1320px}}
h1{{font-size:28px;margin:0 0 20px;padding-top:8px;border-top:2px solid #2B1721}}h2{{margin:0 0 4px;font-size:22px}}p{{margin:0 0 14px;color:#6b5560}}section{{margin-bottom:44px}}
.big{{display:flex;gap:20px}}.big img{{width:650px;border-radius:14px;border:1px solid #eee}}
.small{{display:flex;gap:18px;align-items:center;margin-top:16px}}.small img{{border-radius:6px}}span{{color:#6b5560;font-size:13px}}
</style>{rows}''')

