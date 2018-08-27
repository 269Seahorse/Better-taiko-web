#!/usr/bin/env python2

import sqlite3
import re
import os
from flask import Flask, g, jsonify

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


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


@app.route('/api/songs')
def route_api_songs():
    songs = query_db('select * from songs where enabled = 1')
    songs_out = []
    for song in songs:
        osus = [osu for osu in os.listdir('public/songs/%s' % song[0]) if osu in ['easy.osu', 'normal.osu', 'hard.osu', 'oni.osu']]
        if osus:
            osud = parse_osu('public/songs/%s/%s' % (song[0], osus[0]))
            preview = int(get_osu_key(osud, 'General', 'PreviewTime', 0))
        else:
            preview = 0

        songs_out.append(
            {'id': song[0], 'title': song[1], 'title_en': song[2], 'stars': {
                'easy': song[3], 'normal': song[4],
                'hard': song[5], 'oni': song[6]
            }, 'preview': preview}
        )

    return jsonify(songs_out)


if __name__ == '__main__':
    app.run(port=34801)
