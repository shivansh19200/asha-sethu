from http.server import BaseHTTPRequestHandler, HTTPServer
import hello, visits, understand, agent


class Router(BaseHTTPRequestHandler):
    def do_GET(self):
        hello.handler.do_GET(self)

    def do_POST(self):
        if self.path.startswith('/understand'):
            mod = understand
        elif self.path.startswith('/agent'):
            mod = agent
        else:
            mod = visits
        mod.handler.do_POST(self)


if __name__ == '__main__':
    print('API on http://localhost:3001')
    HTTPServer(('', 3001), Router).serve_forever()