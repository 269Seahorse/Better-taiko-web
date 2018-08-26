#!/usr/bin/env python2

import sqlite3
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
		print song
		songs_out.append(
			{'id': song[0], 'title': song[1], 'title_en': song[2], 'stars': {
				'easy': song[3], 'normal': song[4],
				'hard': song[5], 'oni': song[6]
			}}
		)

	return jsonify(songs_out)


if __name__ == '__main__':
	app.run(port=34801)
