"""write_note() and fill_record(): plain templates. Every medical fact comes from confirmed signs and answers. Nothing here saves or sends."""
import json
from pathlib import Path
from http.server import BaseHTTPRequestHandler
from rules import load_rules

SIGNS = {s['id']: s for s in load_rules()['signs']}
QMAP = {q['id']: q for q in json.loads((Path(__file__).resolve().parents[1] / 'data' / 'questions.json').read_text(encoding='utf-8'))['questions']}
LEVELS = ('RED', 'AMBER', 'UNSURE', 'GREEN')

LAB = {
    'en': {'title': 'REFERRAL NOTE', 'patient': 'Patient', 'code': 'code', 'level': 'Danger level', 'present': 'Signs present',
           'absent': 'Asked and absent', 'unsure': 'Asked, not sure', 'other': "Other concern (worker's words)", 'advice': 'Advice',
           'asha': 'ASHA', 'date': 'Date', 'none': 'none', 'mother': 'Mother', 'newborn': 'Newborn',
           'foot': 'This is an alert aid, not a diagnosis.', 'units': ('year', 'month', 'week', 'day')},
    'hi': {'title': 'रेफ़रल नोट', 'patient': 'रोगी', 'code': 'कोड', 'level': 'ख़तरे का स्तर', 'present': 'मिले लक्षण',
           'absent': 'पूछा गया, नहीं है', 'unsure': 'पूछा गया, पक्का नहीं', 'other': 'अन्य चिंता (कार्यकर्ता के शब्द)', 'advice': 'सलाह',
           'asha': 'आशा', 'date': 'तारीख़', 'none': 'कोई नहीं', 'mother': 'माँ', 'newborn': 'नवजात',
           'foot': 'यह चेतावनी सहायक है, निदान नहीं।', 'units': ('साल', 'महीने', 'सप्ताह', 'दिन')},
}
LEVEL_WORD = {'en': {'RED': 'Red', 'AMBER': 'Amber', 'UNSURE': 'Unsure', 'GREEN': 'Green'},
              'hi': {'RED': 'लाल', 'AMBER': 'पीला', 'UNSURE': 'अनिश्चित', 'GREEN': 'हरा'}}
ADVICE = {'en': {'RED': 'Go to the hospital now.', 'AMBER': 'Go to the health centre today.',
                 'UNSURE': 'Could not rule out danger. Check the list again or ask a doctor.', 'GREEN': 'No danger signs found. Watch at home.'},
          'hi': {'RED': 'अभी अस्पताल जाएँ।', 'AMBER': 'आज स्वास्थ्य केंद्र जाएँ।',
                 'UNSURE': 'ख़तरे से इनकार नहीं कर सकते। सूची फिर देखें या डॉक्टर से पूछें।', 'GREEN': 'कोई ख़तरे का लक्षण नहीं मिला। घर पर निगरानी रखें।'}}


def _clean(d):
    answers = [{'qid': a['qid'], 'answer': a['answer']} for a in d.get('answers', []) if a.get('qid') in QMAP and a.get('answer') in ('yes', 'no', 'unsure')]
    age = d.get('age') or {}
    return {
        'patient': 'mother' if d.get('patient') == 'mother' else 'newborn',
        'signs': [s for s in d.get('signs', []) if s in SIGNS],
        'answers': answers,
        'level': d.get('level') if d.get('level') in LEVELS else 'UNSURE',
        'age': [max(0, min(150, int(age.get(k) or 0))) for k in ('years', 'months', 'weeks', 'days')],
        'other': str(d.get('other_concern', ''))[:300].strip(),
        'asha': str(d.get('asha_name', ''))[:60], 'village': str(d.get('village', ''))[:60],
        'when': str(d.get('when', ''))[:40], 'code': str(d.get('code') or '')[:8],
    }


def _present(c):
    out = list(dict.fromkeys(c['signs'] + [QMAP[a['qid']]['sign'] for a in c['answers'] if a['answer'] == 'yes']))
    return [s for s in out if s in SIGNS]


def _names(ids, lang):
    return [SIGNS[i]['name_hi' if lang == 'hi' else 'name_en'] for i in ids]


def _age_text(c, lang):
    units = LAB[lang]['units']
    parts = []
    for n, u in zip(c['age'], units):
        if n:
            parts.append(f"{n} {u}" + ('s' if lang == 'en' and n > 1 else ''))
    return ' '.join(parts)


def write_note(d, lang='en'):
    c = _clean(d)
    L = LAB[lang]
    present = _present(c)
    absent = [QMAP[a['qid']]['sign'] for a in c['answers'] if a['answer'] == 'no' and QMAP[a['qid']]['sign'] not in present]
    unsure = [QMAP[a['qid']]['sign'] for a in c['answers'] if a['answer'] == 'unsure']
    age = _age_text(c, lang)
    lines = [
        L['title'],
        f"{L['patient']}: {L[c['patient']]}" + (f", {age}" if age else '') + (f", {L['code']} {c['code']}" if c['code'] else ''),
        f"{L['level']}: {LEVEL_WORD[lang][c['level']]}",
        f"{L['present']}: {'; '.join(_names(present, lang)) or L['none']}",
        f"{L['absent']}: {'; '.join(_names(absent, lang)) or L['none']}",
    ]
    if unsure:
        lines.append(f"{L['unsure']}: {'; '.join(_names(unsure, lang))}")
    if c['other']:
        lines.append(f"{L['other']}: {c['other']}")
    lines += [f"{L['advice']}: {ADVICE[lang][c['level']]}", f"{L['asha']}: {c['asha'] or '-'}, {c['village'] or '-'}",
              f"{L['date']}: {c['when'] or '-'}", L['foot']]
    return '\n'.join(lines)


def fill_record(d):
    c = _clean(d)
    present = _present(c)
    feeding = ''
    if c['patient'] == 'newborn':
        if 'nb_not_feeding' in present:
            feeding = 'Not feeding'
        elif any(QMAP[a['qid']]['sign'] == 'nb_not_feeding' and a['answer'] == 'no' for a in c['answers']):
            feeding = 'Feeding, no concern reported'
    return {'visit_date': c['when'], 'patient_type': c['patient'], 'feeding': feeding,
            'danger_signs': _names(present, 'en'), 'advised_action': ADVICE['en'][c['level']], 'referral_made': False}


def send(h, code, obj):
    h.send_response(code)
    h.send_header('Content-Type', 'application/json')
    h.end_headers()
    h.wfile.write(json.dumps(obj, ensure_ascii=False).encode())


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            n = int(self.headers.get('Content-Length', 0))
            d = json.loads(self.rfile.read(n) or b'{}')
            return send(self, 200, {'record': fill_record(d), 'note_en': write_note(d, 'en'), 'note_hi': write_note(d, 'hi')})
        except Exception as e:
            return send(self, 400, {'error': str(e)[:200]})