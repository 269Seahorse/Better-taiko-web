#!/usr/bin/env python2

from __future__ import division

import json
import sqlite3
import re
import os
from flask import Flask, g, jsonify, render_template, request, abort, redirect
from ffmpy import FFmpeg

app = Flask(__name__)
DATABASE = 'taiko.db'


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db


def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv


def parse_osu(osu):
    osu_lines = open(osu, 'r').read().replace('\x00', '').split('\n')
    sections = {}
    current_section = (None, [])

    for line in osu_lines:
        line = line.strip()
        secm = re.match('^\[(\w+)\]$', line)
        if secm:
            if current_section:
                sections[current_section[0]] = current_section[1]
            current_section = (secm.group(1), [])
        else:
            if current_section:
                current_section[1].append(line)
            else:
                current_section = ('Default', [line])
    
    if current_section:
        sections[current_section[0]] = current_section[1]

    return sections


def get_osu_key(osu, section, key, default=None):
    sec = osu[section]
    for line in sec:
        ok = line.split(':', 1)[0].strip()
        ov = line.split(':', 1)[1].strip()

        if ok.lower() == key.lower():
            return ov

    return default


def get_preview(song_id, song_type):
    preview = 0

    if song_type == "tja":
        if os.path.isfile('public/songs/%s/main.tja' % song_id):
            preview = get_tja_preview('public/songs/%s/main.tja' % song_id)
    else:
        osus = [osu for osu in os.listdir('public/songs/%s' % song_id) if osu in ['easy.osu', 'normal.osu', 'hard.osu', 'oni.osu']]
        if osus:
            osud = parse_osu('public/songs/%s/%s' % (song_id, osus[0]))
            preview = int(get_osu_key(osud, 'General', 'PreviewTime', 0))

    return preview


def get_tja_preview(tja):
    tja_lines = open(tja, 'r').read().replace('\x00', '').split('\n')
    
    for line in tja_lines:
        line = line.strip()
        if ':' in line:
            name, value = line.split(':', 1)
            if name.lower() == 'demostart':
                value = value.strip()
                try:
                    value = float(value)
                except ValueError:
                    pass
                else:
                    return int(value * 1000)
        elif line.lower() == '#start':
            break
    return 0


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


@app.route('/')
def route_index():
    version = None
    if os.path.isfile('version.json'):
        version = json.load(open('version.json', 'r'))
    return render_template('index.html', version=version)


@app.route('/api/preview')
def route_api_preview():
    song_id = request.args.get('id', None)
    if not song_id or not re.match('^[0-9]+$', song_id):
        abort(400)

    song_row = query_db('select * from songs where id = ? and enabled = 1', (song_id,))
    if not song_row:
        abort(400)

    song_type = song_row[0][10]
    prev_path = make_preview(song_id, song_type)
    if not prev_path:
        return redirect(''.join([request.host_url, '/songs/%s/main.mp3' % song_id]))

    return redirect(''.join([request.host_url, '/songs/%s/preview.mp3' % song_id]))


@app.route('/api/songs')
def route_api_songs():
    songs = query_db('select * from songs where enabled = 1')
    raw_categories = query_db('select * from categories')
    categories = {}
    def_category = {'title': None, 'title_en': None}
    for cat in raw_categories:
        categories[cat[0]] = {'title': cat[1], 'title_en': cat[2]}
    songs_out = []
    for song in songs:
        song_id = song[0]
        song_type = song[10]
        preview = get_preview(song_id, song_type)
        category_out = categories[song[9]] if song[9] in categories else def_category
        
        songs_out.append({
            'id': song_id,
            'title': song[1],
            'title_en': song[2],
            'stars': [
                song[3], song[4], song[5], song[6], song[7]
            ],
            'preview': preview,
            'category': category_out['title'],
            'category_en': category_out['title_en'],
            'type': song_type,
            'offset': song[11]
        })

    return jsonify(songs_out)


def make_preview(song_id, song_type):
    song_path = 'public/songs/%s/main.mp3' % song_id
    prev_path = 'public/songs/%s/preview.mp3' % song_id

    if os.path.isfile(song_path) and not os.path.isfile(prev_path):
        preview = get_preview(song_id, song_type) / 1000
        if not preview or preview <= 0.1:
            print 'Skipping #%s due to no preview' % song_id
            return False

        print 'Making preview.mp3 for song #%s' % song_id
        ff = FFmpeg(inputs={song_path: '-ss %s' % preview},
                    outputs={prev_path: '-codec:a libmp3lame -b:a 128k -y -loglevel panic'})
        ff.run()

    return prev_path


def check_song_previews():
    with app.app_context():
        songs = query_db('select * from songs where enabled = 1')

    for song in songs:
        make_preview(song[0], song[10])


check_song_previews()


if __name__ == '__main__':
    app.run(port=34801)
