<?php

/*define('DB_HOST',       'localhost');
define('DB_USER',       'root');
define('DB_PASSWORD',   '');
define('DB_SCHEMA',     'test_db');

$link = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_SCHEMA);*/

function getConnection() {
    $host = "localhost";
    $user = "root";
    $password = "";
    $database = "alcpc_db";
    $dsn = "mysql:host=$host;dbname=$database";
    $connection = new PDO($dsn, $user, $password);
//    $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    return $connection;
}