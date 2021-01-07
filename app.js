"use strict";
const config = require("./config");
const mysql = require("mysql");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const expressValidator = require("express-validator");
const alert = require("alert");
const MySQLStore = mysqlSession(session);
const sessionStore = new MySQLStore(config.mysqlConfig);

const DAOUsers = require("./DAOUsers");
const DAOPreguntas = require("./DAOPreguntas");
const DAOEtiquetas = require("./DAOEtiquetas");
const DAORespuestas = require("./DAORespuestas");

// Creación de la sesion
const middlewareSession = session({
    saveUninitialized: false,
    secret: "foobar34",
    resave: false,
    store: sessionStore
});

// Crear un servidor Express.js
const app = express();

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);

const ficherosEstaticos = path.join(__dirname, "public");

const loginRouter = require("./RouterLogin.js");
const preguntasRouter = require("./RouterPreguntas.js");
const respuestasRouter = require("./RouterRespuestas.js");
const usuariosRouter = require("./RouterUsuario.js");

let daoUser = new DAOUsers(pool);
let daoPreguntas = new DAOPreguntas(pool);
let daoEtiquetas = new DAOEtiquetas(pool);
let daoRespuestas= new DAORespuestas(pool);
let moment = require("moment");
const { response } = require("express");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(ficherosEstaticos));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(middlewareSession);
app.use(expressValidator());

//app.use(comprobarLogin);
//app.use(middlewareNotFound);
//app.use(middlewareServerError);

/*
****************************************************************************************************************************************************************
                ARRANCAR EL SERVIDOR EN EL PUERTO 3000
****************************************************************************************************************************************************************                                                                   
*/
app.listen(config.port, function (err) {
    if (err)
        console.log("ERROR al iniciar el servidor");
    else 
        console.log(`Servidor arrancado en el puerto ${config.port}`);
});

/*
****************************************************************************************************************************************************************
               LOGIN USUARIO
****************************************************************************************************************************************************************                                                                   
*/

app.use("/login", loginRouter);

/*
****************************************************************************************************************************************************************
                    PREGUNTAS
****************************************************************************************************************************************************************                                                                   
*/

app.use("/preguntas", preguntasRouter);

/*
****************************************************************************************************************************************************************
                RESPUESTAS
****************************************************************************************************************************************************************
*/

app.use("/respuestas", respuestasRouter);

/*
****************************************************************************************************************************************************************
                USUARIOS
****************************************************************************************************************************************************************
*/

app.use("/usuarios", usuariosRouter);

/*
****************************************************************************************************************************************************************
                ERROR 404
****************************************************************************************************************************************************************                                                                   
*/

function middlewareNotFound(request,response){
    response.status(404);
    response.render("error404",{url:request.url});
}

/*
****************************************************************************************************************************************************************
                ERROR 500
****************************************************************************************************************************************************************                                                                   
*/

function middlewareServerError(error,request,response,next){
    response.status(500);
    response.render("error500",{mensaje:error.message,pila:error.stack});
}


/* No sabemos como funciona esto hulio
app.get("/reset", function(request, response) {
    response.status(200);
    request.session.contador = 0;
    response.type("text/plain");
    response.end("Has reiniciado el contador");
});
*/

// Definición de las funciones callback