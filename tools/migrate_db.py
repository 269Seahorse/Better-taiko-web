#!/usr/bin/env python3
# Migrate old SQLite taiko.db to MongoDB

import sqlite3
from pymongo import MongoClient

client = MongoClient()
client.drop_database('taiko')
db = client.taiko
sqdb = sqlite3.connect('taiko.db')
sqdb.row_factory = sqlite3.Row
curs = sqdb.cursor()

def migrate_songs():
    curs.execute('select * from songs')
    rows = curs.fetchall()

    for row in rows:
        song = {
            'id': row['id'],
            'title': row['title'],
            'title_lang': {'ja': row['title']},
            'subtitle': row['subtitle'],
            'subtitle_lang': {'ja': row['subtitle']},
            'courses': {'easy': None, 'normal': None, 'hard': None, 'oni': None, 'ura': None},
            'enabled': True if row['enabled'] else False,
            'category_id': row['category'],
            'type': row['type'],
            'offset': row['offset'] or 0,
            'skin_id': row['skin_id'],
            'preview': row['preview'] or 0,
            'volume':  row['volume'] or 1.0,
            'maker_id': row['maker_id'],
            'hash': row['hash'],
            'order': row['id']
        }

        for diff in ['easy', 'normal', 'hard', 'oni', 'ura']:
            if row[diff]:
                spl = row[diff].split(' ')
                branch = False
                if len(spl) > 1 and spl[1] == 'B':
                    branch = True
                
                song['courses'][diff] = {'stars': int(spl[0]), 'branch': branch}
        
        if row['title_lang']:
            langs = row['title_lang'].splitlines()
            for lang in langs:
                spl = lang.split(' ', 1)
                if spl[0] in ['ja', 'en', 'cn', 'tw', 'ko']:
                    song['title_lang'][spl[0]] = spl[1]
                else:
                    song['title_lang']['en'] = lang

        if row['subtitle_lang']:
            langs = row['subtitle_lang'].splitlines()
            for lang in langs:
                spl = lang.split(' ', 1)
                if spl[0] in ['ja', 'en', 'cn', 'tw', 'ko']:
                    song['subtitle_lang'][spl[0]] = spl[1]
                else:
                    song['subtitle_lang']['en'] = lang

        db.songs.insert_one(song)

def migrate_makers():
    curs.execute('select * from makers')
    rows = curs.fetchall()

    for row in rows:
        db.makers.insert_one({
            'id': row['maker_id'],
            'name': row['name'],
            'url': row['url']
        })

def migrate_categories():
    curs.execute('select * from categories')
    rows = curs.fetchall()

    for row in rows:
        db.categories.insert_one({
            'id': row['id'],
            'title': row['title']
        })

def migrate_song_skins():
    curs.execute('select * from song_skins')
    rows = curs.fetchall()

    for row in rows:
        db.song_skins.insert_one({
            'id': row['id'],
            'name': row['name'],
            'song': row['song'],
            'stage': row['stage'],
            'don': row['don']
        })

if __name__ == '__main__':
    migrate_songs()
    migrate_makers()
    migrate_categories()
    migrate_song_skins()
