# The full URL base asset URL, with trailing slash.
ASSETS_BASEURL = ''

# The full URL base song URL, with trailing slash.
SONGS_BASEURL = ''

# The email address to display in the "About Simulator" menu.
EMAIL = 'taiko@example.com'

# Whether to use the user account system.
ACCOUNTS = True

# Custom JavaScript file to load with the simulator.
CUSTOM_JS = ''

# MongoDB server settings.
MONGO = {
    'host': ['127.0.0.1:27017'],
    'database': 'taiko'
}

# Redis server settings, used for sessions + cache.
REDIS = {
    'CACHE_TYPE': 'redis',
    'CACHE_REDIS_HOST': '127.0.0.1',
    'CACHE_REDIS_PORT': 6379,
    'CACHE_REDIS_PASSWORD': None,
    'CACHE_REDIS_DB': None
}

# Secret key used for sessions.
SECRET_KEY = 'change-me'

# Git repository base URL.
URL = 'https://github.com/bui/taiko-web/'
