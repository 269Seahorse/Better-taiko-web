At present, songs must be added to taiko-web manually via the database. A song management page is currently in development.

### About songs in taiko-web

taiko-web supports two notechart formats: TJA, and osu!taiko beatmaps (in .osu format). As with official Taiko games, a song can have up to five difficulties (Easy, Normal, Hard, Oni/Extreme, Ura/Inner Oni).

Unlike other simulators, most of the song metadata is read from the song database instead of each individual song file. The following song information is read from the database:

- Title
- Subtitle
- Difficulty stars
- Genre
- Preview time

Most other attributes are read from the song file at runtime.

### About audio

taiko-web only supports MP3 for song audio, since unfortunately [Safari doesn't support Ogg](https://caniuse.com/#feat=ogg-vorbis). You must manually convert your song audio if it is in a different format.

Converting Ogg to MP3 with LAME can sometimes cause very slight offset problems when playing the song in taiko-web. There is an `offset` column in the songs table that can be used to modify the offset independently of the song's existing offset.

You can use taiko-web's debug interface to help find the correct offset for a song. Press `CTRL + SHIFT + ;` while playing a song to open it.

### File structure

For each song in the database, a folder named after the song's ID must exist in the `public/songs/` directory. Within it, you will need the following files:

- **For TJA charts:** `main.tja`
- **For OSU charts:** `easy.osu`, `normal.osu`, `hard.osu`, `oni.osu`, `ura.osu`
  - You only need files for the difficulties you want to add.
- **For both TJA and OSU:** `main.mp3`

In TJA notecharts, `COURSE` labels must correspond to either a numeric or string value as defined below for each difficulty to be recognised:

| ![](https://donderhiroba.jp/image/sp/640/status_10_b4_640.png) | ![](https://donderhiroba.jp/image/sp/640/status_10_b3_640.png) | ![](https://donderhiroba.jp/image/sp/640/status_10_b2_640.png) | ![](https://donderhiroba.jp/image/sp/640/status_10_b1_640.png) | ![](https://donderhiroba.jp/image/sp/640/status_10_b0_640.png) |
|------|--------|------|---------|---------------|
| 0    | 1      | 2    | 3       | 4             |
| Easy | Normal | Hard | Oni     | Edit          |

If you have ffmpeg installed, taiko-web will generate `preview.mp3` files for each song based on the preview time you have set in your chart(s). If for any reason you modify this time in your file, you must delete `preview.mp3` for taiko-web to re-generate it.


### Database structure

| Column          | Type      | Description                                                                        | Example                                                                   |
|-----------------|-----------|------------------------------------------------------------------------------------|---------------------------------------------------------------------------|
| `id`            | `INTEGER` | Unique song ID                                                                     | `1`                                                                       |
| `title`         | `TEXT`    | The song's original name (usually in Japanese)                                     | `さいたま２０００`                                                           |
| `title_lang`    | `TEXT`    | Localised song titles, each on a new line and in the format `<lang> <title>`       | ```en Saitama 2000```<br>```cn 埼玉２０００```<br>```tw 埼玉２０００```<br>```ko 사이타마 2000```    |
| `subtitle`      | `TEXT`    | The song's original subtitle (usually in Japanese)                                 |                                                                           |
| `subtitle_lang` | `TEXT`    | Localised song subtitles, each on a new line and in the format `<lang> <subtitle>` |                                                                           |
| `easy`          | `TEXT`    | Number of stars for Easy difficulty, leave blank if none exists                    | `5`                                                                       |
| `normal`        | `TEXT`    | Number of stars for Normal difficulty, leave blank if none exists                  | `7`                                                                       |
| `hard`          | `TEXT`    | Number of stars for Hard difficulty, leave blank if none exists                    | `7`                                                                       |
| `oni`           | `TEXT`    | Number of stars for Oni difficulty, leave blank if none exists                     | `7 B`                                                                     |
| `ura`           | `TEXT`    | Number of stars for Ura difficulty, leave blank if none exists                     |                                                                           |
| `enabled`       | `INTEGER` | 1 if song is playable, 0 if not                                                    | `1`                                                                       |
| `category`      | `INTEGER` | The song's category/genre ID, from the categories table                            | `7`                                                                       |
| `type`          | `TEXT`    | `tja` or `osu`                                                                     | `tja`                                                                     |
| `offset`        | `REAL`    | taiko-web-specific song offset, in seconds                                         | `-0.015`                                                                  |
| `skin_id`       | `INTEGER` | The song's optional skin ID, from the song_skins table                             |                                                                           |
| `preview`       | `REAL`    | Preview time in song selection                                                     | `74.0`                                                                    |
| `volume`        | `REAL`    | Song volume adjustment. Leave as NULL for the default.                             |                                                                           |
| `maker_id`      | `INTEGER` | ID for chart maker details as defined in the `makers` table.                       |                                                                           |
| `hash`          | `TEXT`    | Unique song hash, generated with taikodb_hash.py                                   |                                                                           |