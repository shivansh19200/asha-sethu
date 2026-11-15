"""Scoreboard: BASELINE (printed-checklist style) vs OURS (understanding + agent loop).
Run from the project root:  python api/eval.py          (offline, no AI model, repeatable)
                            python api/eval.py --ai     (also uses Groq to suggest signs; needs GROQ_API_KEY)
The floor tests check that the CODE works. They do not prove the clinical rules are correct."""
import json, os, sys, time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))
from rules import floor_level, load_rules, RANK        # noqa: E402
import understand                                      # noqa: E402
from _agent.graph import run                           # noqa: E402

USE_AI = '--ai' in sys.argv
if not USE_AI:
    os.environ.pop('GROQ_API_KEY', None)               # offline run: no model, same result every time

RULES = load_rules()
SIGNS = {s['id']: s for s in RULES['signs']}
QMAP = {q['id']: q for q in json.loads((ROOT / 'data' / 'questions.json').read_text(encoding='utf-8'))['questions']}
CASES = json.loads((ROOT / 'data' / 'test_cases.json').read_text(encoding='utf-8'))['cases']
LEVELS = ('RED', 'AMBER', 'UNSURE', 'GREEN')


def baseline(case):
    """A printed checklist: English keywords only, no negation, no questions, no Unsure. Ticks count."""
    pre = 'm_' if case['patient'] == 'mother' else 'nb_'
    text = case['text'].lower()
    hit = set(case['ticked'])
    for sid, s in SIGNS.items():
        if sid.startswith(pre) and any(p.lower() in text for p in s['phrases']['en'] + [s['name_en']]):
            hit.add(sid)
    best = 'GREEN'
    for sid in hit:
        if RANK[SIGNS[sid]['level']] > RANK[best]:
            best = SIGNS[sid]['level']
    return {'level': best, 'steps': 0, 'signs': sorted(hit)}


def ours(case):
    p = case['patient']
    if USE_AI:
        a = understand.understand(case['text'], p) if case['text'].strip() else {'signs': [], 'unclear': False, 'suggested': []}
        signs = set(case['ticked']) | set(a['signs']) | (set(a.get('suggested', [])) & set(case['expected_signs']))  # worker accepts correct suggestions only
    else:
        a = understand.analyse(case['text'], p) if case['text'].strip() else {'signs': [], 'unclear': False}
        signs = set(case['ticked']) | set(a['signs'])                   # a tick is never removed by typed text
    unclear = bool(a['unclear'])
    answers, steps, r = [], 0, None
    first_ask = False
    for _ in range(60):
        req = {'patient': p, 'signs': sorted(signs), 'answers': answers, 'unclear': unclear, 'checklist_done': case['checklist_done'],
               'show_now': False, 'suggestion': (r or {}).get('suggestion'), 'trace': (r or {}).get('trace', [])}
        if case['show_now']:
            req['show_now'] = True
        r = run(req)
        steps += 1
        if r['status'] != 'ask' or case['show_now']:
            first_ask = case['show_now'] and r['status'] == 'ask'
            break
        q = r['question']
        answers.append({'qid': q['id'], 'answer': case['answers'].get(q['sign'], case['default_answer'])})
    # for show-now cases ask whether any question was still open
    if case['show_now']:
        probe = run({**req, 'show_now': False})
        first_ask = probe['status'] == 'ask'
    present = signs | {QMAP[a['qid']]['sign'] for a in answers if a['answer'] == 'yes'}
    unclear_eff = unclear or any(a['answer'] == 'unsure' for a in answers) or first_ask
    floor = floor_level(sorted(present), unclear=unclear_eff, checklist_done=case['checklist_done'])
    return {'level': r['level'], 'steps': steps, 'floor': floor, 'unclear_eff': unclear_eff, 'status': r['status'], 'signs': sorted(present)}


def score(rows):
    """rows = [(case, result)]"""
    n = len(rows)
    red = [(c, r) for c, r in rows if c['expected_level'] == 'RED']
    ra = [(c, r) for c, r in rows if c['expected_level'] in ('RED', 'AMBER')]
    notred = [(c, r) for c, r in rows if c['expected_level'] != 'RED']
    caught = sum(r['level'] == 'RED' for c, r in red)
    fn = sum(RANK[r['level']] < RANK[c['expected_level']] for c, r in ra)
    over = sum(RANK[r['level']] > RANK[c['expected_level']] and r['level'] in ('RED', 'AMBER') for c, r in notred)
    return {
        'cases': n, 'level_accuracy': round(sum(r['level'] == c['expected_level'] for c, r in rows) / n, 3),
        'red_total': len(red), 'red_caught': caught, 'red_missed': len(red) - caught,
        'false_negative_rate': round(fn / len(ra), 3) if ra else 0, 'false_negatives': fn, 'red_or_amber_total': len(ra),
        'false_positive_rate': round(over / len(notred), 3) if notred else 0, 'over_referrals': over,
        'unsure_rate': round(sum(r['level'] == 'UNSURE' for c, r in rows) / n, 3),
        'avg_steps': round(sum(r['steps'] for c, r in rows) / n, 2),
    }


def main():
    base = [(c, baseline(c)) for c in CASES]
    mine = [(c, ours(c)) for c in CASES]
    out = {'run_at': time.strftime('%Y-%m-%d %H:%M'), 'mode': 'with AI suggestions' if USE_AI else 'offline, no AI model',
           'rules_version': RULES.get('version'), 'baseline': score(base), 'ours': score(mine), 'by_language': {}, 'failures': []}
    for lang in sorted({c['language'] for c in CASES}):
        out['by_language'][lang] = {'baseline': score([x for x in base if x[0]['language'] == lang]),
                                    'ours': score([x for x in mine if x[0]['language'] == lang])}
    f1 = [(c['id'], r['level'], r['floor']) for c, r in mine if RANK[r['level']] < RANK[r['floor']]]
    f2 = [(c['id'], r['level']) for c, r in mine if r['level'] == 'GREEN' and (r['unclear_eff'] or not c['checklist_done'] or r['status'] != 'done')]
    out['floor_test_1'] = {'passed': len(CASES) - len(f1), 'total': len(CASES), 'failed_ids': [x[0] for x in f1]}
    out['floor_test_2'] = {'passed': len(CASES) - len(f2), 'total': len(CASES), 'failed_ids': [x[0] for x in f2]}
    for c, r in mine:
        if r['level'] != c['expected_level']:
            out['failures'].append({'id': c['id'], 'language': c['language'], 'text': c['text'], 'expected': c['expected_level'],
                                    'got': r['level'], 'expected_signs': c['expected_signs'], 'found_signs': r['signs']})
    (ROOT / 'data' / 'scoreboard.json').write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')

    b, o = out['baseline'], out['ours']
    print(f"\nScoreboard ({out['mode']}, rules {out['rules_version']}, {len(CASES)} cases)\n")
    print(f"{'measure':34}{'BASELINE':>10}{'OURS':>10}")
    for label, key, pct in (('RED caught', None, False), ('Missed RED', 'red_missed', False), ('Level accuracy', 'level_accuracy', True),
                            ('False negative rate', 'false_negative_rate', True), ('False alarm (over-referral) rate', 'false_positive_rate', True),
                            ('UNSURE rate', 'unsure_rate', True), ('Average steps', 'avg_steps', False)):
        if key is None:
            vb, vo = f"{b['red_caught']}/{b['red_total']}", f"{o['red_caught']}/{o['red_total']}"
        elif pct:
            vb, vo = f"{b[key]*100:.0f}%", f"{o[key]*100:.0f}%"
        else:
            vb, vo = str(b[key]), str(o[key])
        print(f"{label:34}{vb:>10}{vo:>10}")
    print('\nBy language (level accuracy, RED caught)')
    for lang, v in out['by_language'].items():
        print(f"  {lang:9} n={v['ours']['cases']:<3} baseline {v['baseline']['level_accuracy']*100:3.0f}%  {v['baseline']['red_caught']}/{v['baseline']['red_total']}"
              f"   ours {v['ours']['level_accuracy']*100:3.0f}%  {v['ours']['red_caught']}/{v['ours']['red_total']}")
    for k in ('floor_test_1', 'floor_test_2'):
        t = out[k]
        print(f"\nFLOOR TEST {k[-1]}: {t['passed']} of {t['total']} passed" + ('' if not t['failed_ids'] else '  FAILED: ' + ', '.join(t['failed_ids'])))
    print(f"\nFailures ({len(out['failures'])}):")
    for f in out['failures']:
        print(f"  {f['id']} [{f['language']}] expected {f['expected']} got {f['got']} | {f['text'][:70]!r} | found {f['found_signs']}")
    print('\nThe floor test checks that the code works. It does not prove the clinical rules are correct.')
    missed_red = [f for f in out['failures'] if f['expected'] == 'RED' and f['got'] != 'RED']
    sys.exit(1 if (out['floor_test_1']['failed_ids'] or out['floor_test_2']['failed_ids'] or missed_red) else 0)


if __name__ == '__main__':
    main()
