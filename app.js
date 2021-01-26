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
const MySQLStore = mysqlSession(session);
const sessionStore = new MySQLStore(config.mysqlConfig);

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

const preguntasRouter = require("./routers/RouterPreguntas.js");
const respuestasRouter = require("./routers/RouterRespuestas.js");
const usuariosRouter = require("./routers/RouterUsers.js");

let moment = require("moment");
const { response } = require("express");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(ficherosEstaticos));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(middlewareSession);
app.use(expressValidator());

/*
****************************************************************************************************************************************************************
                MIDDLEWARE USUARIO LOGUEADO
****************************************************************************************************************************************************************                                                                   
*/

function middlewareLogin(request,response,next){
    if (request.session.usuario == undefined) {
        response.redirect("/usuarios/login.html");
    } else {
        next();
    }
};

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
                    PREGUNTAS
****************************************************************************************************************************************************************                                                                   
*/

app.use("/preguntas",middlewareLogin, preguntasRouter);

/*
****************************************************************************************************************************************************************
                RESPUESTAS
****************************************************************************************************************************************************************
*/

app.use("/respuestas",middlewareLogin, respuestasRouter);

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

app.use(function middlewareNotFound(request,response){
    response.status(404);
    response.render("error404",{url:request.url});
});


/*
****************************************************************************************************************************************************************
                ERROR 500
****************************************************************************************************************************************************************                                                                   
*/
app.use(function middlewareServerError(request,response){
    response.status(500);
    response.render("error500",{mensaje:request.message});
});

