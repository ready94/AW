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

let daoUser = new DAOUsers(pool);
let daoPreguntas = new DAOPreguntas(pool);
let moment = require("moment");

app.use(express.static(ficherosEstaticos));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(middlewareSession);
app.use(expressValidator());

// Arrancar el servidor en el puerto 3000
app.listen(config.port, function (err) {
    if (err)
        console.log("ERROR al iniciar el servidor");
    else 
        console.log(`Servidor arrancado en el puerto ${config.port}`);
});

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
            request.session.usuario = email; // usuario logueado actualmente
            response.redirect("/pag_principal.html"); // redirecion a la pagina perfil que se muestra por pantalla

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

function validarPass(p1, p2) {

    //la contraseña no tiene espacios en blanco
    var espacios = false;
    var cont = 0;

    while (!espacios && (cont < p1.length)) {
        if (p1.charAt(cont) == " ")
            espacios = true;
        cont++;
    }

    if (espacios) {
        alert("La contraseña no puede contener espacios en blanco");
        return false;
    }

    //que no haya ningun campo vacio
    if (p1.length == 0 || p2.length == 0) {
        alert("Los campos de la password no pueden quedar vacios");
        return false;
    }

    //que la contraseña y la confirmacion sean iguales
    if (p1 != p2) {
        alert("Las passwords deben de coincidir");
        return false;
    } else {
        return true;
    }

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

        icon = "../img/icon" + getRandom(1, 10) + ".png";
    }

    if (request.icon != undefined) {
        icon = request.filter.path;
    }


    if (validarPass(password, password2)) {
        //Expresion regular para validar contraseña
        //primer caracter una letra
        var passw = /^[A-Za-z]\w{3,16}$/;

        if (password.match(passw)) {

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
                    response.redirect("/crear_cuenta.html");
                }
            }
        } else {
            alert("contraseña no valida"); //comen
        }
    }

});

app.get("/pag_principal.html", function(request, response) {
    if (request.session.usuario == undefined) {
        response.redirect("/login.html");
        alert("NO ESTAS LOGUEADO, INDIOTA");
    } else {
        response.locals.email = request.session.usuario;

        daoUser.getUser(response.locals.email, cb_getUser);

        function cb_getUser(error, resultado) {
            if (error) {
                response.status(500);
                console.log("ERROR EN LA BASE DE DATOS");
            } else {

                var usuario = { // valores del usuario
                    nombre: resultado[0].nombre,
                    imagen: resultado[0].imagen
                };
                // guardamos los valores del usuario logueado actualmente en variables de sesion

                request.session.nombre = usuario.nombre;
                request.session.imagen = usuario.imagen;

                response.status(200);
                response.render("pag_principal", { perfil: usuario }); // renderiza la pagina perfil.ejs con los valores del usuario encontrados en la base de datos            
            }
        }
    }
});

app.get("/preguntas.html", function(request, response) {
    if (request.session.usuario == undefined) {
        response.redirect("/login.html");
        alert("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        daoPreguntas.getPreguntas(cb_getPreguntas);

        function cb_getPreguntas(error, resultado){
            if (error) {
                response.status(500);
                console.log("ERROR EN LA BASE DE DATOS");
            } else {

                var pregunta = {
                    idUsuario: resultado[0].id_usuario,
                    titulo: resultado[0].titulo,
                    cuerpo: resultado[0].cuerpo,
                    idEtiquetas: resultado[0].id_etiquetas,
                    fecha: resultado[0].fecha
                };

                daoUser.getUser(pregunta.idUsuario, cb_getUser);

                function cb_getUser(err, res) {
                    if (err) {
                        response.status(500);
                        console.log("ERROR EN LA BASE DE DATOS");
                    } else {

                        var usuario = { // valores del usuario
                            nombre: res[0].nombre,
                            imagen: res[0].imagen
                        };
                        // guardamos los valores del usuario logueado actualmente en variables de sesion

                        response.status(200);
                        response.render("preguntas", { preguntas: pregunta, perfil: usuario }); // renderiza la pagina perfil.ejs con los valores del usuario encontrados en la base de datos            
                    }
                }
            }

        }
        
    }
});

app.get("/formular_pregunta.html", function (request, response) {

    response.status(200);
    response.render("formular_pregunta", { errorMsg: null }); // renderiza la pagina login.ejs

});

app.post("/formularPregunta", function (request, response) {

    
    response.status(200);
    response.render("formular_pregunta", { errorMsg: null }); // renderiza la pagina login.ejs

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