import os, json
from http.server import BaseHTTPRequestHandler, HTTPServer
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        result = {'message': 'hello from python'}
        url = os.getenv('SUPABASE_URL')
        key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        if url and key:
            try:
                from supabase import create_client
                db = create_client(url, key)
                ins = db.table('smoke').insert({'message': 'smoke test'}).execute()
                result['supabase'] = 'ok'
                result['row'] = ins.data
            except Exception as e:
                result['supabase'] = 'error: ' + str(e)[:200]
        else:
            result['supabase'] = 'not configured'
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())

if __name__ == '__main__':
    HTTPServer(('', 3001), handler).serve_forever()