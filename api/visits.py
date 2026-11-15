import os, json, secrets
from http.server import BaseHTTPRequestHandler
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'  # no 0/O/1/I/L
LEVELS = ('RED', 'AMBER', 'UNSURE', 'GREEN')


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
        except Exception:
            return send(self, 400, {'error': 'bad json'})
        if b.get('patient_type') not in ('mother', 'newborn') or b.get('level') not in LEVELS:
            return send(self, 400, {'error': 'invalid visit'})
        try:
            from supabase import create_client
            db = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_ROLE_KEY'])
            cid = b.get('client_id')
            if cid:  # same visit sent twice (retry) -> same code, no duplicate row
                ex = db.table('visits').select('patient_code').eq('client_id', cid).execute().data
                if ex:
                    return send(self, 200, {'patient_code': ex[0]['patient_code']})
            row = {
                'client_id': cid,
                'patient_type': b['patient_type'],
                'age_value': b.get('age_value'),
                'age_unit': b.get('age_unit'),
                'signs': b.get('signs', []),
                'answers': b.get('answers', []),
                'level': b['level'],
                'record': b.get('record', {}),
                'asha_name': b.get('asha_name'),
                'village': b.get('village'),
            }
            for _ in range(8):
                row['patient_code'] = ''.join(secrets.choice(ALPHABET) for _ in range(4))
                try:
                    db.table('visits').insert(row).execute()
                    return send(self, 200, {'patient_code': row['patient_code']})
                except Exception as e:
                    if '23505' in str(e) or 'duplicate' in str(e).lower():
                        continue
                    raise
            return send(self, 500, {'error': 'could not make a code'})
        except Exception as e:
            return send(self, 500, {'error': str(e)[:200]})