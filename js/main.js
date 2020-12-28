"use strict";

const mysql = require("mysql");
const path = require("path");
const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
//esto viene en las diapos
const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const MySQLStore = mysqlSession(session);
const sessionStore = new MySQLStore({
host: "localhost",
user: "root",
password: "",
database: "miBD" });

const middlewareSession = session({
    saveUninitialized: false,
    secret: "foobar34",
    resave: false,
    store: sessionStore
});
main.use(middlewareSession);
    
main.get("/reset", function(request, response) {
    response.status(200);
    request.session.contador = 0;
    response.type("text/plain");
    response.end("Has reiniciado el contador");
    });

//const DAOUsers = require("./DAOUsers.js");
//const DAOTasks = require("./DAOTasks.js");

// Crear el pool de conexiones
/*
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "cafe"
});
*/
//let daoUser = new DAOUsers(pool);
//let daoTask = new DAOTasks(pool);

// Definición de las funciones callback