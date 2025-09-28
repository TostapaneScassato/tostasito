<?php
session_start();
if (isset($_SESSION['user_id'])) {
   header("Location: /dashboard");
   exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === $_POST) {
   $username = trim($_POST['username']);
   $password = $_POST['password'];

   if ($username && $password) {
      $stmt = $mysqli->prepare("SELECT ID , password_hash FROM users WHERE username = ?");
      $stmt->bind_param("s", $username);
      $stmt->execute();
      $result = $stmt->get_result();
      $user = $result->fetch_assoc();

      if ($user && password_verify($password, $user["password_hash"])) {
         $_SESSION["user_id"] = $user["id"];
         header("Location: /dashboard");
         exit;
      } else {
         $error = "Username o Password errati!";
      }
   } else {
      $error = "Compila tutti i campi!";
   }
}
?>

<!DOCTYPE html>
<html lang="it">
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Login</title>
   <link rel="icon" href="./assets/img/favicon.ico">
   <link rel="stylesheet" href="./styles/style.css">
   <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
</head>
<body>
   <header class="flex-container">

      <div class="left">
         <button class="headerButton" id="settingsButton" >
            <i class="material-icons" id="homeIcon">arrow_back</i>
            <p class="headerParagraph">Annulla</p>
         </button>
      </div>
        
      <div class="center">
         <h1 class="title">LOGIN</h1>
      </div>
        
      <div class="right">
         <!-- vuoto, esiste solo per centrare div.center-->
      </div>
   </header>

   <div class="mainBody">
      <form class="loginForm">
         <input type="text" name="user_email" placeholder="Username or E-Mail" required class="loginInput">
         <input type="password" name="user_password" placeholder="Password" required class="loginInput">
         
         <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" id="forgotPassword">Password dimenticata?</a>
      </form>
   </div>

   <script src="./scripts/script.js"></script>
   <script src="./script/auth.js"></script>
</body>
</html>