<?php
$code = http_response_code();
?>

<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>ERROR <?php echo $code ?></title>
    <link rel="icon" type="img/icon" href="./assets/img/favicon.ico">
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <style>
        body{
            background-color: lightblue;
            display: flex;
            flex-direction: column;
            font-size: 30px;
        }
        mark{
            display: flex;
            flex-direction: row;
            justify-content: center;
            background-color: darkorange;
            height: max-content;
            border: 3px black dashed;
            border-radius: 20px;
        }
        h2{
            text-align: center;
        }
        h2#top{
            margin-top: 70px;
            margin-bottom: 0px;
            font-style: italic;
        }
        h2#bottom{
            margin-top: 25px;
        }
        button{
            display: flex;
            align-items: center;
            align-self: center;
            justify-content: center;
            font-size: 35px;
            border: 3px blue dotted;
            border-radius: 10px;
            width: max-content;
            background-color: aquamarine;
            cursor: pointer;
            transition: background-color 100ms;
            box-shadow: 2px 2px 2px 0px rgba(0,0,0,0.60);
        }
        button:hover{
            background-color: rgb(92, 214, 174);
        }
        button:active{
            box-shadow: none;
        }

        .material-icons{
            font-size: 50px;
            margin: 10px;
            text-align: center;
            flex-direction: row;
        }
        .material-icons#title{
            font-size: 100px;
            margin: 20px;
        }
        .material-icons{
            scale: 100%;
        }
    </style>
</head>
<body>
    <mark>
        <i class="material-icons" id="title">warning</i>
        <h1 class="title">ERRORE <?php echo $code ?></h1>
        <i class="material-icons" id="title">warning</i>
    </mark>
    <h2 id="top">Non sei tu, sono io!</h2>
    <h2 id="bottom">C'è stato un erroe a livello del server, riprova più tardi.</h2>
    <button onclick="window.location.href='/home'">
        <i class="material-icons">home</i>
        <p>Torna alla home</p>
        <i class="material-icons">home</i>
    </button>
</body>
</html>