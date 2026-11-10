import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'agrirent-ml-jwt-secret-key-2026-supersecure')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'agrirent-ml-jwt-secret-key-2026-supersecure')
    JWT_EXPIRATION_HOURS = int(os.environ.get('JWT_EXPIRATION_HOURS', 168)) # 7 days

    # MySQL Configuration (Default local, can be overridden by ENV)
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_PORT = int(os.environ.get('MYSQL_PORT', 3306))
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
    MYSQL_DB = os.environ.get('MYSQL_DB', 'agrirent_db')

    # SQLite Fallback Configuration (Guarantees immediate zero-config plug-and-play)
    SQLITE_DB_PATH = os.path.join(BASE_DIR, 'agrirent.db')

    # Uploads folder
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024 # 16 MB max

