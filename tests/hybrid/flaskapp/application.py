import random

from flask import ( Flask, render_template, jsonify )

app = Flask(__name__)

@app.get('/')
def index():
    return render_template('index.html.j2')

@app.get('/api')
def api():
    return jsonify({'lucky': random.randrange(1, 100)})

application = app