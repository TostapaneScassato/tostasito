import sqlite3, json, random, yagmail, os
from flask import Flask, request, jsonify, session, redirect
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta, UTC
from pathlib import Path
from email_validator import validate_email, EmailNotValidError
from dotenv import load_dotenv

"""
DB STRUCTURE:

CREATE TABLE IF NOT EXISTS users:
--------------+-----------------------------------
id            | INTEGER PRIMARY KEY AUTOINCREMENT
username      | TEXT UNIQUE NOT NULL
password_hash | TEXT NOT NULL
created_at    | TEXT NOT NULL
vip           | BOOL DEFAULT 0
email         | TEXT UNIQUE
--------------+----------------

CREATE TABLE IF NOT EXISTS user_settings:
--------+---------------------------------
user_id | INTEGER NOT NULL
key     | TEXT NOT NULL
value   | TEXT DEFAULT ''

PRIMARY KEY (user_id, key)
FOREIGN KEY (user_id) REFERENCES users(id)
-------------------------------------------

CREATE TABLE IF NOT EXISTS password_resets:
-----------+--------------------------------
user_id    | INTEGER NOT NULL
code       | TEXT NOT NULL
expires_at | TEXT NOT NULL
used       | INTEGER DEFAULT 0

PRIMARY KEY (user_id),
FOREIGN KEY (user_id) REFERENCES users(id)

============================================================
============================================================

API ADDRESSES (/api/*):

NAME     | METHOD | NOTES
---------+--------+----------------------
register |  post  | create a new account
login    |  post  | log into an existing account
logout   |  post  | remove user from session
settings |  get   | obtain all settings saved for the user
"  "     |  post  | update settings for the user
me       |  get   | obtain user's username, creation date and vip status
account  |  post  | modify the user's account's data
confirm-password  |  post  | check if given password is equal to saved password
password-reset    | 
\\           \\   |  confirm-email |  post  | check if given email exists and returns user_id
||           ||   |  verify        |  post  | verifies if code corresponds and repaces password
"""

app = Flask(__name__)
app.secret_key = "stringaSuperSegretaDel20012026"

bcrypt = Bcrypt(app)

BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / "database.db"

ENV_PATH = BASE_DIR.parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)

SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
yag = yagmail.SMTP(SMTP_USER, SMTP_PASS)

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
   email    = data.get("email", "").strip()
   password = data.get("password", "")

   if len(username) < 3:
      return jsonify(error="Username troppo corto"), 400
   if len(password) < 8:
      return jsonify(error="Password troppo corta"), 400
   
   if email == "":
      valid_email = ""
   else:
      try:
         valid = validate_email(email)
         valid_email = valid.email
      except EmailNotValidError as err:
         print(str(err))
         return jsonify(error="Email non valida"), 400

   pw_hash = bcrypt.generate_password_hash(password).decode()

   conn = get_db()
   cur = conn.cursor()

   try:
      cur.execute(
         "INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
         (username, valid_email, pw_hash, datetime.utcnow().isoformat())
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

   username_or_email = data.get("usernameOrEmail", "").strip()
   password = data.get("password", "")

   is_email = False

   if "@" in username_or_email and "." in username_or_email:
      try:
         validate_email(username_or_email)
         is_email = True
      except EmailNotValidError:
         return jsonify(error="Email non valida"), 400

   conn = get_db()
   cur = conn.cursor()

   if is_email:
      cur.execute("SELECT * FROM users WHERE email = ?", (username_or_email, ))
   else:
      cur.execute("SELECT * FROM users WHERE username = ?", (username_or_email, ))

   user = cur.fetchone()
   conn.close()

   if not user:
      return jsonify(error="Credenziali errate"), 401
   
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
      "orario": '{"subject-1.1":"","subject-1.2":"","subject-1.3":"","subject-1.4":"","subject-1.5":"","subject-1.6":"",'
                 '"subject-2.1":"","subject-2.2":"","subject-2.3":"","subject-2.4":"","subject-2.5":"","subject-2.6":"",'
                 '"subject-3.1":"","subject-3.2":"","subject-3.3":"","subject-3.4":"","subject-3.5":"","subject-3.6":"",'
                 '"subject-4.1":"","subject-4.2":"","subject-4.3":"","subject-4.4":"","subject-4.5":"","subject-4.6":"",'
                 '"subject-5.1":"","subject-5.2":"","subject-5.3":"","subject-5.4":"","subject-5.5":"","subject-5.6":"",'
                 '"subject-6.1":"","subject-6.2":"","subject-6.3":"","subject-6.4":"","subject-6.5":"","subject-6.6":""}'
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

@app.get("/api/me")
def me():
   conn = get_db()
   cur = conn.cursor()

   if "user_id" not in session:
      return jsonify(logged_in=False)

   user_id = session["user_id"]

   cur.execute("SELECT username, email, created_at, vip FROM users WHERE id = ?", (user_id, ))
   row = cur.fetchone()

   if not row:
      return jsonify(logged_in=False)
   return jsonify(logged_in=True,
      username=row[0],
      email=row[1],
      created_at=row[2],
      vip=row[3])

@app.post("/api/confirm-password")
def confirm_password():
   if "user_id" not in session:
      return jsonify(error="Non autenticato"), 401

   data = request.json or {}
   password = data.get("password")

   if not password:
      return jsonify(error="Password mancante"), 400
   
   conn = get_db()
   cur = conn.cursor()

   cur.execute("SELECT password_hash FROM users WHERE id=?", (session["user_id"],))
   row = cur.fetchone()
   conn.close()

   if not row:
      return jsonify(error="Utente inesistente"), 404
   
   password_hash = row["password_hash"]

   if not bcrypt.check_password_hash(password_hash, password):
      return jsonify(valid=False), 403
   
   return jsonify(valid=True)

@app.post("/api/password-reset/confirm-email")
def confirm_email():
   data = request.json or {}
   email = data.get("email")

   if not email:
      return jsonify(error="Email mancante"), 400
   
   conn = get_db()
   cur = conn.cursor()

   cur.execute("SELECT id FROM users WHERE email = ?", (email,))
   row = cur.fetchone()

   if row:
      user_id = row["id"]

      code = f"{random.randint(0, 999999):06d}"
      expires_at = (datetime.now(UTC) + timedelta(minutes=10)).isoformat()

      cur.execute("""
         INSERT INTO password_resets (user_id, code, expires_at, used)
         VALUES (?, ?, ?, 0)
         ON CONFLICT (user_id)
         DO UPDATE SET code=excluded.code,
                       expires_at=excluded.expires_at,
                       used=0
      """, (user_id, code, expires_at))

      conn.commit()

   conn.close()

   subject = "Tostasito - Recupero della password"
   body = f"""
   Ciao,

   Mi è giunta voce che hai scordato la password del tuo account.
   Non ti preoccupare, inserisci il codice {code} per reimpostarla, ma sbrigati, perché scade tra 10 minuti!

   Come dici? Non hai richiesto tu questa mail? Allora ignorala pure, tra 10 minuti il codice finirà nell'oblio e l'hacker rimarrà fregato!

   - Carletti Stefano
   """

   try:
      yag.send(to=email, subject=subject, contents=body)
      print(f"[RECUPERO PASSWORD] Inviata mail di recupero a {email}")
   except Exception as e:
      print(f"[ERRORE]-[RECUPERO PASSWORD] Impossibile inviare l'Email: {e}")

   return jsonify(valid=True, user_id=user_id)

@app.post("/api/password-reset/verify")
def verify_code():
   data = request.json or {}
   user_id = data.get("user_id")
   code = data.get("code")
   new_password = data.get("password")

   if not user_id or not code or not new_password:
      return jsonify(error="Campi mancanti"), 400
   
   if len(new_password) < 8:
      return jsonify(error="Password troppo corta"), 400
   
   conn = get_db()
   cur = conn.cursor()

   cur.execute("SELECT code, expires_at, used FROM password_resets WHERE user_id=?", (user_id,))
   row = cur.fetchone()

   if not row:
      conn.close()
      return jsonify(error="Codice di reset insesistente"), 404
   
   if row["used"]:
      conn.close()
      return jsonify(error="Codice già utilizzato"), 403
   
   if row["code"] != code:
      conn.close()
      return jsonify(error="Codice errato"), 400
   
   expires_at = datetime.fromisoformat(row["expires_at"])
   if datetime.now(UTC) > expires_at:
      conn.close()
      return jsonify(error="Codice scaduto"), 403
   
   new_hash = bcrypt.generate_password_hash(new_password).decode()
   cur.execute("UPDATE users SET password_hash=? WHERE id=?", (new_hash, user_id))
   cur.execute("UPDATE password_resets SET used=1 WHERE user_id=?", (user_id,))
   conn.commit()
   conn.close()

   return jsonify(success=True)


@app.post("/api/account")
def modify_account():
   if "user_id" not in session:
      return jsonify(error="Non autenticato"), 401
   
   data = request.json or {}

   allowed_fields = {
      "username": str,
      "email"   : str,
      "password": str
   }

   updates = {}

   for key, expected_type in allowed_fields.items():
      if key in data:
         if not isinstance(data[key], expected_type):
            return jsonify(error=f"Tipo non valido per {key}"), 400
         updates[key] = data[key]
      
   if not updates:
      return jsonify(error="Nessun campo da aggiornare"), 400
   
   conn = get_db()
   cur = conn.cursor()

   try:
      if ("username" in updates) and (updates["username"] != ""):
         cur.execute("UPDATE users SET username=? WHERE id=?", (updates["username"], session["user_id"]))

      if ("email" in updates) and (updates["email"] != "") and ("@" in updates["email"]) and ("." in updates["email"]):
         try:
            valid = validate_email(updates["email"])
            valid_email = valid.email
         except EmailNotValidError as err:
            print(str(err))
            return jsonify(error="Email non valida"), 400
         
         cur.execute("UPDATE users SET email=? WHERE id=?", (valid_email, session["user_id"]))

      if ("password" in updates) and (updates["password"] != ""):
         new_hash = bcrypt.generate_password_hash(updates["password"]).decode()
         cur.execute("UPDATE users SET password_hash=? WHERE id=?", (new_hash, session["user_id"]))

      conn.commit()

   except sqlite3.IntegrityError:
      return jsonify(error="Username o email già esistenti"), 409

   finally:
      conn.close()

   return jsonify(success=True)

"""
# error handlers
@app.errorhandler(400)
def bad_request(e):
   return redirect("/errors/400")

@app.errorhandler(403)
def forbidden(e):
   return redirect("/errors/403")

@app.errorhandler(404)
def not_found(e):
   return redirect("/errors/404")

@app.errorhandler(405)
def method_not_allowed(e):
   return redirect("/errors/405")
"""

app.run(host="0.0.0.0", port=5000)
