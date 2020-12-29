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

const DAOUsers = require("./DAOUsers.js");

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

// Arrancar el servidor en el puerto 3000
app.listen(config.port, function(err) {
    if (err)
        console.log("ERROR al iniciar el servidor");
    else
        console.log(`Servidor arrancado en el puerto ${config.port}`);
});

let daoUser = new DAOUsers(pool);
let moment = require("moment");

app.use(express.static(ficherosEstaticos));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(middlewareSession);
app.use(expressValidator());

app.get("/login.html", function(request, response) {

    response.status(200);
    response.render("login", { errorMsg: null }); // renderiza la pagina login.ejs

});

app.post("/login", function(request, response) { // peticion a la view login.ejs

    var email = request.body.mail;
    var password = request.body.pass;

    daoUser.isUserCorrect(email, password, cd_isUserCorrect) // comprobacion si el user esta en la base de datos

    function cd_isUserCorrect(err, resultado) {
        if (err) {
            response.status(500);
            console.log("ERROR CON LA BASE DE DATOS " + err);
            response.render("login", { errorMsg: null })
        } else if (resultado.length != 0) {
            console.log("USUARIO LOGUEADO CORRECTAMENTE");
            request.session.currentUser = email; // usuario logueado actualmente
            response.redirect("/perfil.html"); // redirecion a la pagina perfil que se muestra por pantalla

        } else {
            console.log("ERROR AL LOGUEAR USUARIO ");
            response.render("login", { errorMsg: " Dirección de correo y/o contraseña no válidos." }) //renderiza la pagina perfil.ejs
        }
    }
});

app.get("/logout", function(request, response) { // desconecta el usuario logueado actualmente
    request.session.destroy();
    console.log("Usuario deslogueado correctamente")
    response.redirect("/login.html");
});


// CREAR CUENTA

// Retorna un entero aleatorio entre min (incluido) y max (excluido)
// ¡Usando Math.round() te dará una distribución no-uniforme!
function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

app.get("/crear_cuenta.html", function(request, response) {

    response.status(200);
    response.render("crear_cuenta", { errorMsg: null }); // renderiza la pagina login.ejs

});

app.post("/crearCuenta", function(request, response) { // peticion a la view login.ejs

    var email = request.body.mail;
    var password = request.body.pass;
    var password2 = request.body.pass_confirm;
    var nick = request.body.nick;
    var icon = request.body.icon;

    if (request.icon == undefined) {

        icon = "../public/img/icon" + getRandom(1, 10) + ".png";
    }

    if (request.icon != undefined)
        icon = request.filter.path;

    //Expresion regular para validar contraseña
    var passw = /^[A-Za-z]\w{7,14}$/;
    //if (password == password2) {
    if (password.match(passw)) {
        console.log("contraseña valida");
    } else {
        console.log("contraseña no valida");
    }
    // } //to do



    if (password != password2) //to do
        password = "";


    var usuario = {
        email: email,
        password: password,
        nombre: nick,
        imagen: icon,
        fecha_alta: new Date()
    }

    daoUser.insertUser(usuario, cd_insertUser); //insertamos el usuario en la BBDD

    function cd_insertUser(err, resultado) {
        if (err) {
            response.status(500);
            console.log("ERROR BBDD" + err); //comen
            if (err.sqlState == 2300) {
                alert("Email ya existente");
            };
            response.render("crear_cuenta", { errorMsg: null })
        } else if (resultado.length != 0) {
            console.log("USUARIO CREADO CORRECTAMENTE"); //comen
            response.redirect("/login.html"); // redirecion a la pagina login si no ha habido errores 
        } else {
            console.log("ERROR AL CREAR EL USUARIO "); //comen
            response.redirect("/login.html");
        }
    }

});


/* No sabemos como funciona esto hulio
app.get("/reset", function(request, response) {
    response.status(200);
    request.session.contador = 0;
    response.type("text/plain");
    response.end("Has reiniciado el contador");
});
*/




// Definición de las funciones callback