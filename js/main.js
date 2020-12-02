"use strict";

const mysql = require("mysql");
//const DAOUsers = require("./DAOUsers.js");
//const DAOTasks = require("./DAOTasks.js");

// Crear el pool de conexiones
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "cafe"
});

//let daoUser = new DAOUsers(pool);
//let daoTask = new DAOTasks(pool);

// Definición de las funciones callback