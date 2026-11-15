from http.server import BaseHTTPRequestHandler, HTTPServer
import visits, understand, agent, note, referral, care, transcribe

ROUTES = {'/understand': understand, '/agent': agent, '/note': note, '/referral': referral, '/care': care, '/transcribe': transcribe}


class Router(BaseHTTPRequestHandler):
    def do_POST(self):
        mod = next((m for p, m in ROUTES.items() if self.path.startswith(p)), visits)
        mod.handler.do_POST(self)


if __name__ == '__main__':
    print('API on http://localhost:3001')
    HTTPServer(('', 3001), Router).serve_forever()