#!/usr/bin/env python3

from http.server import BaseHTTPRequestHandler, HTTPServer

class TestRequestHandler(BaseHTTPRequestHandler):
  def cors_headers(self):
      """ Sets headers required for CORS """
      self.send_header("Access-Control-Allow-Origin", "*")
      self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
      self.send_header("Access-Control-Allow-Headers", "Super-Special-Header")

  def do_OPTIONS(self):
      self.send_response(200)
      self.cors_headers()
      self.end_headers()

  def do_GET(self):
      self.send_response(200)
      self.cors_headers()
      self.send_header("Content-Type", "text/plain")
      self.end_headers()
      self.wfile.write(bytes("That was a GET!", "utf8"));

  def do_POST(self):
      self.send_response(200)
      self.cors_headers()
      self.send_header("Content-Type", "text/plain")
      self.end_headers()
      self.wfile.write(bytes("That was a POST!", "utf8"));

print("Starting server")
httpd = HTTPServer(("127.0.0.1", 8000), TestRequestHandler)
print("Hosting server on port 8000")
httpd.serve_forever()
