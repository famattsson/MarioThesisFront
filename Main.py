import datetime
import random
from flaskext.autoversion import Autoversion

from flask import Flask, render_template

app = Flask(__name__)
app.autoversion = True
Autoversion(app)

buildid = random.randint(0, 1000000)

@app.route('/')
def root():
    # For the sake of example, use static information to inflate the template.
    # This will be replaced with real information in later steps.

    return render_template("index_new.html")


#192.168.1.135

if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    # Flask's development server will automatically serve static files in
    # the "static" directory. See:
    # http://flask.pocoo.org/docs/1.0/quickstart/#static-files. Once deployed,
    # App Engine itself will serve those files as configured in app.yaml.
    app.run(host='127.0.0.1', port=14545, debug=True)
