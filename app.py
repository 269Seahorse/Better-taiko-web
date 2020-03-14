#!/usr/bin/env python3

import bcrypt
import json
import re
import schema
import os

from functools import wraps
from flask import Flask, g, jsonify, render_template, request, abort, redirect, session
from flask_caching import Cache
from flask_session import Session
from ffmpy import FFmpeg
from pymongo import MongoClient

app = Flask(__name__)
client = MongoClient()

try:
    app.secret_key = open('secret.txt').read().strip()
except FileNotFoundError:
    app.secret_key = os.urandom(24).hex()
    with open('secret.txt', 'w') as fp:
        fp.write(app.secret_key)
        fp.close()

app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_COOKIE_HTTPONLY'] = False
app.cache = Cache(app, config={'CACHE_TYPE': 'redis'})
sess = Session()
sess.init_app(app)

db = client.taiko
db.users.create_index('username', unique=True)

DEFAULT_URL = 'https://github.com/bui/taiko-web/'


def api_error(message):
    return jsonify({'status': 'error', 'message': message})


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('username'):
            return api_error('not_logged_in')
        return f(*args, **kwargs)
    return decorated_function


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('username'):
            return abort(403)

        user = db.users.find_one({'username': session.get('username')})
        if user['user_level'] < 50:
            return abort(403)

        return f(*args, **kwargs)
    return decorated_function


@app.before_request
def before_request_func():
    if session.get('session_id'):
        if not db.users.find_one({'session_id': session.get('session_id')}):
            session.clear()


def get_config():
    if os.path.isfile('config.json'):
        try:
            config = json.load(open('config.json', 'r'))
        except ValueError:
            print('WARNING: Invalid config.json, using default values')
            config = {}
    else:
        print('WARNING: No config.json found, using default values')
        config = {}

    if not config.get('songs_baseurl'):
        config['songs_baseurl'] = ''.join([request.host_url, 'songs']) + '/'
    if not config.get('assets_baseurl'):
        config['assets_baseurl'] = ''.join([request.host_url, 'assets']) + '/'

    config['_version'] = get_version()
    return config


def get_version():
    version = {'commit': None, 'commit_short': '', 'version': None, 'url': DEFAULT_URL}
    if os.path.isfile('version.json'):
        try:
            ver = json.load(open('version.json', 'r'))
        except ValueError:
            print('Invalid version.json file')
            return version

        for key in version.keys():
            if ver.get(key):
                version[key] = ver.get(key)

    return version


@app.route('/')
@app.cache.cached(timeout=15)
def route_index():
    version = get_version()
    return render_template('index.html', version=version, config=get_config())


@app.route('/admin')
@admin_required
def route_admin():
    return redirect('/admin/songs')


@app.route('/admin/songs')
@admin_required
def route_admin_songs():
    songs = db.songs.find({})
    return render_template('admin_songs.html', songs=list(songs))


@app.route('/admin/songs/<int:id>')
@admin_required
def route_admin_songs_id(id):
    song = db.songs.find_one({'id': id})
    if not song:
        return abort(404)

    categories = list(db.categories.find({}))
    song_skins = list(db.song_skins.find({}))

    return render_template('admin_song_detail.html',
        song=song, categories=categories, song_skins=song_skins)


@app.route('/api/preview')
@app.cache.cached(timeout=15, query_string=True)
def route_api_preview():
    song_id = request.args.get('id', None)
    if not song_id or not re.match('^[0-9]+$', song_id):
        abort(400)

    song = db.songs.find_one({'id': song_id})
    if not song:
        abort(400)

    song_type = song['type']
    prev_path = make_preview(song_id, song_type, song['preview'])
    if not prev_path:
        return redirect(get_config()['songs_baseurl'] + '%s/main.mp3' % song_id)

    return redirect(get_config()['songs_baseurl'] + '%s/preview.mp3' % song_id)


@app.route('/api/songs')
@app.cache.cached(timeout=15)
def route_api_songs():
    songs = list(db.songs.find({'enabled': True}, {'_id': False, 'enabled': False}))
    for song in songs:
        if song['maker_id']:
            if song['maker_id'] == 0:
                song['maker'] = 0
            else:
                song['maker'] = db.makers.find_one({'id': song['maker_id']}, {'_id': False})
        else:
            song['maker'] = None
        del song['maker_id']

        if song['category_id']:
            song['category'] = db.categories.find_one({'id': song['category_id']})['title']
        else:
            song['category'] = None
        del song['category_id']

        if song['skin_id']:
            song['song_skin'] = db.song_skins.find_one({'id': song['skin_id']}, {'_id': False, 'id': False})
        else:
            song['song_skin'] = None
        del song['skin_id']

    return jsonify(songs)


@app.route('/api/config')
@app.cache.cached(timeout=15)
def route_api_config():
    config = get_config()
    return jsonify(config)


@app.route('/api/register', methods=['POST'])
def route_api_register():
    data = request.get_json()
    if not schema.validate(data, schema.register):
        return abort(400)

    if session.get('username'):
        session.clear()

    username = data.get('username', '')
    if len(username) < 3 or len(username) > 20 or not re.match('^[a-zA-Z0-9_]{3,20}$', username):
        return api_error('invalid_username')

    if db.users.find_one({'username_lower': username.lower()}):
        return api_error('username_in_use')

    password = data.get('password', '').encode('utf-8')
    if not 6 <= len(password) <= 5000:
        return api_error('invalid_password')

    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password, salt)

    session_id = os.urandom(24).hex()
    db.users.insert_one({
        'username': username,
        'username_lower': username.lower(),
        'password': hashed,
        'display_name':  username,
        'user_level': 1,
        'session_id': session_id
    })

    session['session_id'] = session_id
    session['username'] = username
    session.permanent = True
    return jsonify({'status': 'ok', 'username': username, 'display_name': username})


@app.route('/api/login', methods=['POST'])
def route_api_login():
    data = request.get_json()
    if not schema.validate(data, schema.login):
        return abort(400)

    if session.get('username'):
        session.clear()

    username = data.get('username', '')
    result = db.users.find_one({'username_lower': username.lower()})
    if not result:
        return api_error('invalid_username_password')

    password = data.get('password', '').encode('utf-8')
    if not bcrypt.checkpw(password, result['password']):
        return api_error('invalid_username_password')

    session['session_id'] = result['session_id']
    session['username'] = result['username']
    if data.get('remember'):
        session.permanent = True

    return jsonify({'status': 'ok', 'username': result['username'], 'display_name': result['display_name']})


@app.route('/api/logout', methods=['POST'])
@login_required
def route_api_logout():
    session.clear()
    return jsonify({'status': 'ok'})


@app.route('/api/account/display_name', methods=['POST'])
@login_required
def route_api_account_display_name():
    data = request.get_json()
    if not schema.validate(data, schema.update_display_name):
        return abort(400)

    display_name = data.get('display_name', '').strip()
    if not display_name:
        display_name = session.get('username')
    elif len(display_name) > 25:
        return api_error('invalid_display_name')
    
    db.users.update_one({'username': session.get('username')}, {
        '$set': {'display_name': display_name}
    })

    return jsonify({'status': 'ok', 'display_name': display_name})


@app.route('/api/account/password', methods=['POST'])
@login_required
def route_api_account_password():
    data = request.get_json()
    if not schema.validate(data, schema.update_password):
        return abort(400)

    user = db.users.find_one({'username': session.get('username')})
    current_password = data.get('current_password', '').encode('utf-8')
    if not bcrypt.checkpw(current_password, user['password']):
        return api_error('current_password_invalid')
    
    new_password = data.get('new_password', '').encode('utf-8')
    if not 6 <= len(new_password) <= 5000:
        return api_error('invalid_new_password')
    
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(new_password, salt)
    session_id = os.urandom(24).hex()

    db.users.update_one({'username': session.get('username')}, {
        '$set': {'password': hashed, 'session_id': session_id}
    })

    session['session_id'] = session_id
    return jsonify({'status': 'ok'})


@app.route('/api/account/remove', methods=['POST'])
@login_required
def route_api_account_remove():
    data = request.get_json()
    if not schema.validate(data, schema.delete_account):
        return abort(400)

    user = db.users.find_one({'username': session.get('username')})
    password = data.get('password', '').encode('utf-8')
    if not bcrypt.checkpw(password, user['password']):
        return api_error('verify_password_invalid')

    db.scores.delete_many({'username': session.get('username')})
    db.users.delete_one({'username': session.get('username')})

    session.clear()
    return jsonify({'status': 'ok'})


@app.route('/api/scores/save', methods=['POST'])
@login_required
def route_api_scores_save():
    data = request.get_json()
    if not schema.validate(data, schema.scores_save):
        return abort(400)

    username = session.get('username')
    if data.get('is_import'):
        db.scores.delete_many({'username': username})

    scores = data.get('scores', [])
    for score in scores:
        db.scores.update_one({'username': username, 'hash': score['hash']},
        {'$set': {
            'username': username,
            'hash': score['hash'],
            'score': score['score']
        }}, upsert=True)

    return jsonify({'status': 'ok'})


@app.route('/api/scores/get')
@login_required
def route_api_scores_get():
    username = session.get('username')

    scores = []
    for score in db.scores.find({'username': username}):
        scores.append({
            'hash': score['hash'],
            'score': score['score']
        })

    user = db.users.find_one({'username': username})
    return jsonify({'status': 'ok', 'scores': scores, 'username': user['username'], 'display_name': user['display_name']})


def make_preview(song_id, song_type, preview):
    song_path = 'public/songs/%s/main.mp3' % song_id
    prev_path = 'public/songs/%s/preview.mp3' % song_id

    if os.path.isfile(song_path) and not os.path.isfile(prev_path):
        if not preview or preview <= 0:
            print('Skipping #%s due to no preview' % song_id)
            return False

        print('Making preview.mp3 for song #%s' % song_id)
        ff = FFmpeg(inputs={song_path: '-ss %s' % preview},
                    outputs={prev_path: '-codec:a libmp3lame -ar 32000 -b:a 92k -y -loglevel panic'})
        ff.run()

    return prev_path


if __name__ == '__main__':
    app.run(port=34801)
