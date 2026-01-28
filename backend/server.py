import sqlite3, json
from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from datetime import datetime
from pathlib import Path

app = Flask(__name__)
app.secret_key = "stringaSuperSegretaDel20012026"

bcrypt = Bcrypt(app)

BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / "database.db"

def get_db():
   conn = sqlite3.connect(DB_PATH)
   conn.row_factory = sqlite3.Row
   return conn

@app.post("/api/register")
def register():
   data = request.get_json(silent=True)
   if not data:
      return jsonify(error="JSON invalido"), 400

   username = data.get("username", "").strip()
   password = data.get("password", "")

   if len(username) < 3:
      return jsonify(error="Username troppo corto"), 400
   if len(password) < 8:
      return jsonify(error="Password troppo corta"), 400
   
   pw_hash = bcrypt.generate_password_hash(password).decode()

   conn = get_db()
   cur = conn.cursor()

   try:
      cur.execute(
         "INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)",
         (username, pw_hash, datetime.utcnow().isoformat())
      )

      conn.commit()
   except sqlite3.IntegrityError:
      return jsonify(error="Username già esistente"), 409
   finally:
      conn.close()

   return jsonify(success=True)

@app.post("/api/login")
def login():
   data = request.get_json(silent=True)
   if not data:
      return jsonify(error="JSON invalido"), 400

   username = data.get("username", "")
   password = data.get("password", "")

   conn = get_db()
   cur = conn.cursor()

   cur.execute("SELECT * FROM users WHERE username = ?", (username, ))
   user = cur.fetchone()
   conn.close()

   if not user:
      return jsonify(error="Il nome utente non esiste"), 401
   
   if not bcrypt.check_password_hash(user["password_hash"], password):
      return jsonify(error="Password errata"), 401
   
   session["user_id"] = user["id"]

   return jsonify(success=True)


@app.post("/api/logout")
def logout():
   session.clear()
   return jsonify(success=True)

def require_login():
   return "user_id" not in session

@app.get("/api/settings")
def get_settigs():
   if require_login():
      return jsonify(error="Devi prima fare l'accesso"), 401
   
   conn = get_db()
   cur = conn.cursor()

   cur.execute("SELECT key, value FROM user_settings WHERE user_id = ?", (session["user_id"], ))
   rows = cur.fetchall()
   conn.close()

   settings = {row["key"]: row["value"] for row in rows}

   defaults = {
      "tema": "dark",
      "verifiche": "[]",
      "orario": '{"subject-1.1":"","subject-1.2":"","subject-1.3":"","subject-1.4":"","subject-1.5":"","subject-1.6":"","subject-2.1":"","subject-2.2":"","subject-2.3":"","subject-2.4":"","subject-2.5":"","subject-2.6":"","subject-3.1":"","subject-3.2":"","subject-3.3":"","subject-3.4":"","subject-3.5":"","subject-3.6":"","subject-4.1":"","subject-4.2":"","subject-4.3":"","subject-4.4":"","subject-4.5":"","subject-4.6":"","subject-5.1":"","subject-5.2":"","subject-5.3":"","subject-5.4":"","subject-5.5":"","subject-5.6":"","subject-6.1":"","subject-6.2":"","subject-6.3":"","subject-6.4":"","subject-6.5":"","subject-6.6":""}'
   }
   for k, v in defaults.items():
      if k not in settings:
         settings[k] = v

   return jsonify(settings)

@app.post("/api/settings")
def update_settings():
   if require_login():
      return jsonify(error="Devi prima fare l'accesso"), 401
   
   data = request.json
   allowed_keys = ["tema", "verifiche", "orario"]

   conn = get_db()
   cur = conn.cursor()

   for key in allowed_keys:
      if key in data:
         value = data[key]

         if not isinstance(value, str):
            value = json.dumps(value)

         cur.execute("""
            INSERT INTO user_settings (user_id, key, value)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, key) DO UPDATE SET value=excluded.value
         """, (session["user_id"], key, value))

   conn.commit()
   conn.close()

   return jsonify(success=True)

# database structure: 'id', 'username', 'password_hash', 'created_at', 'vip'
# database types:  INTEGER,  TEXT,       TEXT,            TEXT,         BOOL

@app.get("/api/me")
def me():
   conn = get_db()
   cur = conn.cursor()

   if "user_id" not in session:
      return jsonify(logged_in=False)

   user_id = session["user_id"]

   cur.execute("SELECT username, created_at, vip FROM users WHERE id = ?", (user_id, ))
   row = cur.fetchone()

   if not row:
      return jsonify(logged_in=False)
   return jsonify(logged_in=True,
      username=row[0],
      created_at=row[1],
      vip=row[2])


app.run(host="0.0.0.0", port=5000)
