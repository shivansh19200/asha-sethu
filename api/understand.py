import os, re, json, unicodedata
from difflib import SequenceMatcher
from http.server import BaseHTTPRequestHandler

RULES_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'rules.json')
ALIAS = {'nahin': 'nahi', 'nhi': 'nahi', 'nahii': 'nahi', 'nai': 'nahi'}


def norm(s):
    s = unicodedata.normalize('NFC', s.lower())
    s = ''.join(c if (c.isalnum() or unicodedata.category(c).startswith('M')) else ' ' for c in s)
    return s.split()


def fold(tok):
    # Spelling tolerance for Hinglish/English: ee->i, oo->u, aa->a, collapse repeats.
    if not tok.isascii():
        return tok
    tok = tok.replace('ee', 'i').replace('oo', 'u').replace('aa', 'a')
    tok = re.sub(r'(.)\1+', r'\1', tok)
    return ALIAS.get(tok, tok)


def tokens(s):
    return [fold(t) for t in norm(s)]


# Negators before the sign ("no fever") vs after it ("bukhar nahi").
NEG_PRE = {fold(w) for w in ['no', 'not', 'without', 'never', 'dont', 'don', 'doesn', 'didn', 'isn', 'hasn', 'wasn', 'बिना']}
NEG_POST = {fold(w) for w in ['nahi', 'nahin', 'nhi', 'नहीं', 'नही', 'नहि']}
CONJ = {'and', 'aur', 'but', 'lekin', 'par', 'और', 'लेकिन', 'पर'}

_rules = json.load(open(RULES_PATH, encoding='utf-8'))
SIGNS = _rules['signs']


def _phrases(s):
    raw = [p for lang in s['phrases'].values() for p in lang] + [s['name_en'], s['name_hi']]
    return [t for t in (tokens(p) for p in raw) if t]


PHRASES = {s['id']: _phrases(s) for s in SIGNS}


def tok_match(a, b):
    if a == b:
        return True
    # typo tolerance only for longer Latin words (so 'not' never matches 'now')
    return a.isascii() and b.isascii() and len(a) >= 5 and len(b) >= 5 and SequenceMatcher(None, a, b).ratio() >= 0.8


def find_spans(toks, ptoks):
    n = len(ptoks)
    return [(i, i + n) for i in range(len(toks) - n + 1) if all(tok_match(toks[i + k], ptoks[k]) for k in range(n))]


def analyse(text, patient):
    pre = 'm_' if patient == 'mother' else 'nb_'
    ids = [s['id'] for s in SIGNS if s['id'].startswith(pre)]
    present, negated, unclear, any_match = [], [], False, False

    for chunk in re.split(r'[,;.!?\n।]+', text):
        toks = tokens(chunk)
        if not toks:
            continue
        matches = sorted({(sid, i, j) for sid in ids for p in PHRASES[sid] for (i, j) in find_spans(toks, p)}, key=lambda m: (m[1], -m[2]))
        covered = {k for _, i, j in matches for k in range(i, j)}
        attached = {m: 0 for m in matches}

        def nearest(k, side):
            best = None
            for m in matches:
                _, i, j = m
                if side == 'R' and i > k and i - k - 1 <= 2 and not (CONJ & set(toks[k + 1:i])):
                    if best is None or i < best[1]:
                        best = m
                if side == 'L' and j <= k and k - j <= 2 and not (CONJ & set(toks[j:k])):
                    if best is None or j > best[2]:
                        best = m
            return best

        stray_neg = False
        for k, tok in enumerate(toks):
            if k in covered or not (tok in NEG_PRE or tok in NEG_POST):
                continue
            target = None
            for side in (('R',) if tok in NEG_PRE else ('L',)):  # strict: never guess the other side
                target = nearest(k, side)
                if target:
                    break
            if target:
                attached[target] += 1
            else:
                stray_neg = True

        if not matches:
            if stray_neg:
                unclear = True
            continue
        any_match = True
        if stray_neg:
            unclear = True
        for (sid, i, j), n in attached.items():
            if n >= 2:
                unclear = True  # double negation: do not guess
            if n == 1:
                negated.append(sid)
            else:
                present.append(sid)

    present = list(dict.fromkeys(present))
    negated = [s for s in dict.fromkeys(negated) if s not in present]
    if text.strip() and not any_match:
        unclear = True
    return {'signs': present, 'negated': negated, 'unclear': unclear}


def send(h, code, obj):
    h.send_response(code)
    h.send_header('Content-Type', 'application/json')
    h.end_headers()
    h.wfile.write(json.dumps(obj).encode())


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            n = int(self.headers.get('Content-Length', 0))
            b = json.loads(self.rfile.read(n) or b'{}')
            text = str(b.get('text', ''))[:2000]
            patient = 'mother' if b.get('patient') == 'mother' else 'newborn'
        except Exception:
            return send(self, 400, {'error': 'bad json'})
        return send(self, 200, analyse(text, patient))