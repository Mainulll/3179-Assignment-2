"""Serve this checkout explicitly and disable caching for local preview reloads."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
class PreviewHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        for header in ('If-Modified-Since', 'If-None-Match'):
            if header in self.headers:
                del self.headers[header]
        return super().send_head()
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1', 8000), partial(PreviewHandler, directory=str(ROOT)))
    print(f'Local preview: http://127.0.0.1:8000/\nCheckout: {ROOT}\nAsset caching disabled.', flush=True)
    server.serve_forever()
