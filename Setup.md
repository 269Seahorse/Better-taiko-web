## Requirements
To set up and configure taiko-web, you'll need a few things:

* A Linux server with the following software installed:
    * Git
    * Python 3.5 (or later)
    * nginx
    * MongoDB
    * **Optional**: FFmpeg
        * Must be compiled with libmp3lame codec
    * **Optional**: Redis
    * **Optional**: Supervisor
    * **Optional**: python3-virtualenv
* Songs. taiko-web supports TJA and OSU charts.

While it may be possible to set up taiko-web under different environments (eg. using Windows Server, or a web server other than nginx), they are untested and unsupported.

## Setup
### Installing the requirements
If you have not already done so, install the above-listed software on your server. The following commands were ran on a Debian 10 system, you may need to alter them depending on your OS.

```bash
su
apt update
apt install git python3-pip nginx
```
It is recommended to install these optional packages as well.

```bash
apt install ffmpeg redis supervisor python3-virtualenv
```
### Installing MongoDB
Consult the [MongoDB installation tutorial](https://docs.mongodb.com/manual/installation/) for your operating system to install MongoDB Community Edition on your system.

### Obtaining taiko-web
Next, clone the taiko-web repository into a directory of your choosing.

```bash
su -c 'mkdir -p /srv/taiko-web'
su -c 'chown $USER /srv/taiko-web'
git clone https://github.com/bui/taiko-web.git /srv/taiko-web
```
All the commands you run from now on must be ran inside the taiko-web directory, so change your working directory.

```bash
cd /srv/taiko-web
```
Run the following commands to install requirements and set default configurations.

```bash
pip3 install -r requirements.txt
tools/get_version.sh
cp tools/hooks/* .git/hooks/
cp config.example.py config.py
```
Edit config.py in a text editor to configure taiko-web for your system.
### nginx setup
Let's set up nginx now. Copy the example virtual host file `tools/nginx.conf` to `/etc/nginx/conf.d/taiko-web.conf`, changing the `server_name` and `root` statements as required.

```bash
su -
cp /srv/taiko-web/tools/nginx.conf /etc/nginx/conf.d/taiko-web.conf
```
Next, open `/etc/nginx/nginx.conf` and comment out the line which displays the default nginx page.

```conf
include /etc/nginx/sites-enabled/*;
```
becomes
```conf
#include /etc/nginx/sites-enabled/*;
```
Then, open `/etc/nginx/mime.types` and add this line near the bottom:

```
application/wasm wasm;
```
Once you've configured the files, reload nginx (as root). Assuming everything was configured correctly, you shouldn't get any errors.

```bash
nginx -s reload
```
If you try to access your simulator now, you should get a 502 error. That's because we haven't started the app server yet, so let's do that!

### taiko-web setup
We'll first create virtual environments for Python and install the required modules.

```bash
virtualenv -p python3 /srv/taiko-web/.venv
source /srv/taiko-web/.venv/bin/activate
pip install -r /srv/taiko-web/requirements.txt
deactivate
```
It is recommended that you use a process manager such as [Supervisor](http://supervisord.org/) to keep taiko-web running at all times.

Copy the example configuration file from `tools/supervisor.conf` to `/etc/supervisor/conf.d/taiko-web.conf`, adjusting it as needed.

```bash
su
mkdir -p /var/log/taiko-web
cp tools/supervisor.conf /etc/supervisor/conf.d/taiko-web.conf
```
Then, restart Supervisor (as root).

```bash
su -
service supervisor restart
```
And you can check the status of supervisor with this command, to see if anything went wrong (also as root).

```bash
supervisorctl status
```

We're almost there! taiko-web has been installed and when you start the database you will be able to run it too, but there will be no default songs. Let's fix that!

### Database setup
Create a folder for MongoDB to store files and start it.

```bash
su -
mkdir -p /data/db
systemctl enable mongod.service
service mongod start
```
At this point, taiko-web is ready to be opened in browser. Navigate to `localhost` in a web browser and register an admin account (this guide assumes username "admin" as an example).

Open the MongoDB shell by running `mongo` and execute the following queries to set up admin permission level:

```
use taiko
db.users.findOneAndUpdate({username:"admin"},{$set:{user_level:100}})
exit
```
We will also import song genres to the database.

```bash
mongoimport --db taiko --collection categories --file /srv/taiko-web/tools/categories.json --jsonArray
```
Type `exit` if you are still root.

### Adding songs
So we have the song genres, but still no songs. In taiko-web, each song has a folder under `public/songs/` corresponding to its ID in the database. There isn't a songs folder by default, so make one.

```bash
mkdir -p public/songs/1
```
Then, copy the music and a chart file with filenames `main.ogg` and `main.tja` respectively into the newly-created directory.

As long as you are logged in on taiko-web, you should be able to navigate to `localhost/admin/songs` in your browser and add song metadata from there. After you add a song it should appear in the game.

And... that's it! Assuming you did everything correctly, you should now be able to access your simulator and play the song you just added.

### Updating
If you want to update taiko-web from an older version, you will need to pull the changes from git and restart the supervisor.

```bash
cd /srv/taiko-web
git pull
su -c 'supervisorctl restart all'
```
It is recommended to review pull request notes as sometimes you might need to do some configuring.

## Conclusion
If any part of this guide wasn't clear, please ask Bui on the [Taiko no Tatsujin Discord](https://discord.gg/ZpW62Vf) for clarification so the guide can be updated accordingly.

Happy drumming!
