import sqlite3

conn = sqlite3.connect("database.db")
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS users (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   username TEXT UNIQUE NOT NULL,
   email TEXT UNIQUE,
   password_hash TEXT NOT NULL,
   created_at TEXT NOT NULL,
   vip BOOL DEFAULT 0
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS user_settings (
   user_id INTEGER NOT NULL,
   key TEXT NOT NULL,
   value TEXT DEFAULT '',
   PRIMARY KEY (user_id, key),
   FOREIGN KEY(user_id) REFERENCES users(id)
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS  password_resets (
   user_id INTEGER NOT NULL,
   code TEXT NOT NULL,
   expires_at TEXT NOT NULL,
   used INTEGER DEFAULT 0,
   PRIMARY KEY (user_id),
   FOREIGN KEY (user_id) REFERENCES users(id)
)
""")

conn.commit()
conn.close()