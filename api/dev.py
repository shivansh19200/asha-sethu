from http.server import BaseHTTPRequestHandler, HTTPServer
import hello, visits, understand


class Router(BaseHTTPRequestHandler):
    def do_GET(self):
        hello.handler.do_GET(self)

    def do_POST(self):
        mod = understand if self.path.startswith('/understand') else visits
        mod.handler.do_POST(self)


if __name__ == '__main__':
    print('API on http://localhost:3001')
    HTTPServer(('', 3001), Router).serve_forever()