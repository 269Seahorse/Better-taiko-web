# Taiko no Tatsujin Web
A web version of Taiko no Tatsujin

Running instance: https://taiko.bui.pm

Still in developement. Works best with Chrome.

## Setup
**Requirements**: Python 2.7, [Flask](https://pypi.org/project/Flask/)

Create a SQLite databse named `taiko.db` with the following schema:

    CREATE TABLE "songs" ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, `title` TEXT NOT NULL, `title_en` TEXT, `easy` INTEGER, `normal` INTEGER, `hard` INTEGER, `oni` INTEGER, `enabled` INTEGER NOT NULL, `category` INTEGER, `type` TEXT , `offset` REAL NOT NULL )
    CREATE TABLE "categories" ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, `title` TEXT NOT NULL, `title_en` TEXT NOT NULL )

When inserting song rows, leave any difficulty columns as NULL if you don't intend to add notecharts for them.

Each song's data is contained within a directory under `public/songs/`. For example:

    └───public
        ├───songs
        │   ├───1
        │   │       bg.png
        │   │       easy.osu
        │   │       hard.osu
        │   │       main.mp3
        │   │       normal.osu
        │   │       oni.osu
        │   │

Run `app.py`, and use any web server to serve `public/` as the root directory, while routing `/api/` to the Flask server.
