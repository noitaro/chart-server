import os
from flask import Flask, render_template, send_from_directory
from flask_cors import CORS
import requests
import json
import pybotters
import pandas as pd
import datetime

app = Flask(__name__, static_folder=None, template_folder="./app/dist")
app.config['JSON_AS_ASCII'] = False
CORS(app)


@app.route("/", methods=['GET'])
def index():
    # return "<h1>Hello, Flask!</h1>"
    return render_template('index.html')
    
@app.route('/assets/<path:filename>')
def static(filename):
    return send_from_directory("./app/dist/assets", filename)

@app.route('/hello')
def hello():
    return 'Welcome! MyApp!'


@app.route('/func')
def func():
    return 'Welcome! MyFunction!'


if __name__ == "__main__":
    app.debug = True
    app.run(host="0.0.0.0", port=80, debug=True)
