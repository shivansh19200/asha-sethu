import json
from http.server import BaseHTTPRequestHandler
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass
from _agent.graph import run


def send(h, code, obj):
    h.send_response(code)
    h.send_header('Content-Type', 'application/json')
    h.end_headers()
    h.wfile.write(json.dumps(obj).encode())


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            n = int(self.headers.get('Content-Length', 0))
            req = json.loads(self.rfile.read(n) or b'{}')
        except Exception:
            return send(self, 400, {'error': 'bad json'})
        try:
            return send(self, 200, run(req))
        except Exception as e:
            return send(self, 500, {'error': str(e)[:200]})