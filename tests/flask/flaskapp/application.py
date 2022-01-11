from flask import ( Flask, render_template )

app = Flask(__name__)

@app.get('/')
def index():
    return render_template('index.html.j2')

@app.get('/about/')
def about():
    return render_template('about.html.j2')

application = app