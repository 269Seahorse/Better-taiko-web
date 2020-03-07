import os
import sys
import hashlib
import base64
import sqlite3

def md5(md5hash, filename):
	with open(filename, "rb") as file:
		for chunk in iter(lambda: file.read(64 * 1024), b""):
			md5hash.update(chunk)

def get_hashes(root):
	hashes = {}
	diffs = ["easy", "normal", "hard", "oni", "ura"]
	dirs = os.listdir(root)
	for dir in dirs:
		dir_path = os.path.join(root, dir)
		if dir.isdigit() and os.path.isdir(dir_path):
			files = os.listdir(dir_path)
			md5hash = hashlib.md5()
			if "main.tja" in files:
				md5(md5hash, os.path.join(dir_path, "main.tja"))
			else:
				for diff in diffs:
					if diff + ".osu" in files:
						md5(md5hash, os.path.join(dir_path, diff + ".osu"))
			hashes[dir] = base64.b64encode(md5hash.digest())[:-2]
	return hashes

def write_db(database, songs):
	db = sqlite3.connect(database)
	hashes = get_hashes(songs)	
	added = 0
	for id in hashes:
		added += 1
		cur = db.cursor()
		cur.execute("update songs set hash = ? where id = ?", (hashes[id].decode(), int(id)))
		cur.close()
	db.commit()
	db.close()
	if added:
		print("{0} hashes have been added to the database.".format(added))
	else:
		print("Error: No songs were found in the given directory.")

if len(sys.argv) >= 3:
	write_db(sys.argv[1], sys.argv[2])
else:
	print("Usage: taikodb_hash.py ../taiko.db ../public/songs")
