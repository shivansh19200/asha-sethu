"""Care-team API: history, follow-up status, doctor inbox, supervisor counts.
Doctor/supervisor actions need CARE_ACCESS_CODE. This is a PROTOTYPE gate, not real security. No names anywhere."""
import os, re, json, hmac
from datetime import datetime, timezone, timedelta
from http.server import BaseHTTPRequestHandler
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

DUE_DAYS = {'RED': 1, 'AMBER': 2}
RANK = {'RED': 0, 'AMBER': 1, 'UNSURE': 2, 'GREEN': 3}
FOLLOWUP = ('reached', 'not_yet', 'could_not_go')
FIELDS = 'patient_code,family_code,patient_type,age_value,age_unit,signs,level,village,created_at,referral_sent_at,received_at,followup,record'


def send(h, code, obj):
    h.send_response(code)
    h.send_header('Content-Type', 'application/json')
    h.end_headers()
    h.wfile.write(json.dumps(obj).encode())


def parse(ts):
    if not ts:
        return None
    return datetime.fromisoformat(re.sub(r'\.\d+', '', str(ts)).replace('Z', '+00:00'))


def clean(code):
    return ''.join(c for c in str(code or '').upper() if c.isalnum())[:8]


def authed(b):
    want = os.environ.get('CARE_ACCESS_CODE')
    return bool(want) and hmac.compare_digest(str(b.get('access', '')), want)


# ---------- pure logic (tested without a database) ----------
def sort_inbox(rows):
    rows = [r for r in rows if r.get('referral_sent_at')]
    rows.sort(key=lambda r: str(r.get('referral_sent_at')), reverse=True)  # newest first
    rows.sort(key=lambda r: RANK.get(r.get('level'), 9))                   # then Red before Amber (stable)
    return [{
        'code': r.get('family_code') or r.get('patient_code'), 'patient_type': r.get('patient_type'),
        'age_value': r.get('age_value'), 'age_unit': r.get('age_unit'), 'signs': r.get('signs') or [],
        'level': r.get('level'), 'village': r.get('village'), 'sent_at': r.get('referral_sent_at'),
        'received': bool(r.get('received_at')), 'demo': bool((r.get('record') or {}).get('demo')),
    } for r in rows]


def overdue_of(r, now):
    sent = parse(r.get('referral_sent_at'))
    days = DUE_DAYS.get(r.get('level'))
    return bool(sent and days and r.get('followup') != 'reached' and now > sent + timedelta(days=days))


def build_summary(rows, now):
    week = now - timedelta(days=7)
    rows = [r for r in rows if (parse(r.get('created_at')) or now) >= week]
    villages, signs = {}, {}
    overdue = []
    for r in rows:
        v = r.get('village') or 'Unknown'
        d = villages.setdefault(v, {'village': v, 'visits': 0, 'red': 0, 'unreached': 0})
        d['visits'] += 1
        d['red'] += r.get('level') == 'RED'
        if r.get('referral_sent_at') and r.get('followup') != 'reached':
            d['unreached'] += 1
        for s in set(r.get('signs') or []):
            signs[(v, s)] = signs.get((v, s), 0) + 1
        if overdue_of(r, now):
            hrs = int((now - parse(r['referral_sent_at']) - timedelta(days=DUE_DAYS[r['level']])).total_seconds() // 3600)
            overdue.append({'code': r.get('family_code') or r.get('patient_code'), 'level': r['level'], 'village': v, 'hours_overdue': hrs})
    alerts = [{'village': v, 'sign': s, 'count': n} for (v, s), n in sorted(signs.items(), key=lambda x: -x[1]) if n >= 3]
    return {'villages': sorted(villages.values(), key=lambda d: -d['visits']), 'alerts': alerts, 'overdue': overdue,
            'demo': any((r.get('record') or {}).get('demo') for r in rows)}


def demo_rows(now):
    def row(i, ptype, signs, level, village, ago_h, sent=True, fu=None, received=False):
        t = (now - timedelta(hours=ago_h)).isoformat()
        return {'client_id': f'demo-{i}', 'patient_code': f'DM{i:02d}', 'family_code': f'DM{i:02d}', 'patient_type': ptype,
                'age_value': 5 if ptype == 'newborn' else 24, 'age_unit': 'days' if ptype == 'newborn' else 'years',
                'signs': signs, 'answers': [], 'level': level, 'village': village, 'created_at': t,
                'referral_sent_at': t if sent else None, 'received_at': t if received else None, 'followup': fu,
                'record': {'demo': True}}
    return [
        row(1, 'newborn', ['nb_fever'], 'RED', 'Demo Village A', 80),
        row(2, 'newborn', ['nb_fever', 'nb_not_feeding'], 'RED', 'Demo Village A', 50, received=True),
        row(3, 'newborn', ['nb_fever'], 'RED', 'Demo Village A', 20),
        row(4, 'mother', ['m_headache'], 'AMBER', 'Demo Village A', 100, fu='not_yet'),
        row(5, 'mother', ['m_headache', 'm_vision'], 'RED', 'Demo Village B', 30, received=True, fu='reached'),
        row(6, 'newborn', ['nb_not_feeding'], 'AMBER', 'Demo Village B', 10),
        row(7, 'mother', ['m_swelling'], 'AMBER', 'Demo Village B', 60, sent=False),
        row(8, 'newborn', ['nb_fever'], 'RED', 'Demo Village C', 5),
    ]


# ---------- handler ----------
class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            n = int(self.headers.get('Content-Length', 0))
            b = json.loads(self.rfile.read(n) or b'{}')
        except Exception:
            return send(self, 400, {'error': 'bad json'})
        act = b.get('action')
        if act in ('inbox', 'receive', 'summary', 'seed_demo', 'clear_demo') and not authed(b):
            return send(self, 401, {'error': 'access code needed'})
        try:
            from supabase import create_client
            db = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_ROLE_KEY'])
            now = datetime.now(timezone.utc)
            code = clean(b.get('code'))
            match = f'patient_code.eq.{code},family_code.eq.{code}'
            if act == 'history':
                rows = db.table('visits').select(FIELDS).or_(match).order('created_at', desc=True).limit(5).execute().data
                return send(self, 200, {'visits': [{
                    'signs': r.get('signs') or [], 'level': r.get('level'), 'patient_type': r.get('patient_type'),
                    'days_ago': max(0, (now - (parse(r.get('created_at')) or now)).days)} for r in rows]})
            if act == 'followup' and b.get('status') in FOLLOWUP and code:
                db.table('visits').update({'followup': b['status']}).or_(match).not_.is_('referral_sent_at', 'null').execute()
                return send(self, 200, {'ok': True})
            if act == 'status':
                codes = [clean(c) for c in (b.get('codes') or [])][:50]
                out = {}
                if codes:
                    rows = db.table('visits').select('patient_code,family_code,received_at').in_('family_code', codes).execute().data
                    for r in rows:
                        k = r.get('family_code') or r.get('patient_code')
                        out[k] = out.get(k, False) or bool(r.get('received_at'))
                return send(self, 200, {'received': out})
            if act == 'inbox':
                rows = db.table('visits').select(FIELDS).not_.is_('referral_sent_at', 'null').limit(300).execute().data
                return send(self, 200, {'items': sort_inbox(rows)})
            if act == 'receive' and code:
                db.table('visits').update({'received_at': now.isoformat()}).or_(match).not_.is_('referral_sent_at', 'null').execute()
                return send(self, 200, {'ok': True})
            if act == 'summary':
                since = (now - timedelta(days=8)).isoformat()
                rows = db.table('visits').select(FIELDS).gte('created_at', since).limit(1000).execute().data
                return send(self, 200, build_summary(rows, now))
            if act == 'seed_demo':
                db.table('visits').delete().like('client_id', 'demo-%').execute()
                db.table('visits').insert(demo_rows(now)).execute()
                return send(self, 200, {'ok': True})
            if act == 'clear_demo':
                db.table('visits').delete().like('client_id', 'demo-%').execute()
                return send(self, 200, {'ok': True})
            return send(self, 400, {'error': 'unknown action'})
        except Exception as e:
            return send(self, 500, {'error': str(e)[:200]})
