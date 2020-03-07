from __future__ import division
import os
import sqlite3
import re
DATABASE = 'taiko.db'

conn = sqlite3.connect(DATABASE)
curs = conn.cursor()

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


if __name__ == '__main__':
	songs = curs.execute('select id, type from songs').fetchall()
	for song in songs:
		preview = get_preview(song[0], song[1]) / 1000
		curs.execute('update songs set preview = ? where id = ?', (preview, song[0]))
	conn.commit()
