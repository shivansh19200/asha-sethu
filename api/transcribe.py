"""Speech to text for phones. The browser records a short clip, this sends it to Groq Whisper and returns the text.
Works on any phone browser that can record audio (Chrome, Safari, Firefox). No audio is stored."""
import os, json, base64, uuid, urllib.request, urllib.error
from http.server import BaseHTTPRequestHandler

URL = 'https://api.groq.com/openai/v1/audio/transcriptions'
MODEL = os.environ.get('GROQ_STT_MODEL', 'whisper-large-v3-turbo')
MAX_BYTES = 3_000_000   # Vercel limits request bodies to about 4.5 MB


def build_form(audio, mime, lang):
    b = uuid.uuid4().hex
    mime = (mime or 'audio/webm').split(';')[0]
    ext = 'mp4' if 'mp4' in mime else 'ogg' if 'ogg' in mime else 'wav' if 'wav' in mime else 'webm'
    out = []

    def field(name, value):
        out.append(f'--{b}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode())

    field('model', MODEL)
    field('response_format', 'json')
    field('temperature', '0')
    if lang == 'hi':
        field('language', 'hi')
    field('prompt', 'ASHA worker describing a newborn or a mother: baby, bacha, bukhar, doodh, saans, daura, fits, bleeding.')
    out.append(f'--{b}\r\nContent-Disposition: form-data; name="file"; filename="clip.{ext}"\r\nContent-Type: {mime}\r\n\r\n'.encode() + audio + b'\r\n')
    out.append(f'--{b}--\r\n'.encode())
    return b''.join(out), b


def transcribe(audio, mime, lang):
    key = os.environ.get('GROQ_API_KEY')
    if not key:
        return {'error': 'Voice is not set up on the server (no GROQ_API_KEY).'}
    body, b = build_form(audio, mime, lang)
    req = urllib.request.Request(URL, data=body, headers={
        'Authorization': 'Bearer ' + key, 'Content-Type': 'multipart/form-data; boundary=' + b, 'User-Agent': 'asha-sethu/0.1'})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return {'text': (json.loads(r.read()).get('text') or '').strip()}
    except urllib.error.HTTPError as e:
        return {'error': 'Speech service said: ' + e.read().decode('utf-8', 'ignore')[:200]}
    except Exception as e:
        return {'error': type(e).__name__ + ': ' + str(e)[:150]}


def send(h, code, obj):
    h.send_response(code)
    h.send_header('Content-Type', 'application/json')
    h.end_headers()
    h.wfile.write(json.dumps(obj).encode())


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            n = int(self.headers.get('Content-Length', 0))
            if n > MAX_BYTES * 1.4:
                return send(self, 413, {'error': 'Clip too long. Please speak for less time.'})
            req = json.loads(self.rfile.read(n))
            audio = base64.b64decode(req.get('audio', ''))
            if len(audio) < 1000:
                return send(self, 200, {'text': ''})
            send(self, 200, transcribe(audio, req.get('mime'), req.get('lang')))
        except Exception as e:
            send(self, 400, {'error': 'Bad request: ' + str(e)[:100]})
