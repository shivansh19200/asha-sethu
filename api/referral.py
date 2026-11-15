import os, json
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass


def send(h, code, obj):
    h.send_response(code)
    h.send_header('Content-Type', 'application/json')
    h.end_headers()
    h.wfile.write(json.dumps(obj).encode())


class handler(BaseHTTPRequestHandler):
    """Marks a saved visit as 'referral sent'. Only runs after the worker taps Send referral."""
    def do_POST(self):
        try:
            n = int(self.headers.get('Content-Length', 0))
            cid = str(json.loads(self.rfile.read(n) or b'{}').get('client_id', ''))[:64]
        except Exception:
            return send(self, 400, {'error': 'bad json'})
        if not cid:
            return send(self, 400, {'error': 'client_id needed'})
        try:
            from supabase import create_client
            db = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_ROLE_KEY'])
            rows = db.table('visits').select('record').eq('client_id', cid).execute().data
            if not rows:
                return send(self, 404, {'error': 'visit not saved yet'})
            rec = dict(rows[0].get('record') or {})
            rec['referral_made'] = True
            db.table('visits').update({'record': rec, 'referral_sent_at': datetime.now(timezone.utc).isoformat()}).eq('client_id', cid).execute()
            return send(self, 200, {'ok': True})
        except Exception as e:
            return send(self, 500, {'error': str(e)[:200]})