
var config = require("./config");
var mysql = require("mysql");
var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");
var session = require("express-session");
var mysqlSession = require("express-mysql-session");
var MySQLStore = mysqlSession(session);
var sessionStore = new MySQLStore(config.mysqlConfig);

var login = express.Router();

var DAOUsers = require("./DAOUsers");
var pool = mysql.createPool(config.mysqlConfig);

var daoUser = new DAOUsers(pool);


/*
****************************************************************************************************************************************************************
                TIENE QUE ESTAR LOGGEADO
****************************************************************************************************************************************************************                                                                   
*/

function comprobarLogin(request, response, next) {
    console.log("ha entrado")
    console.log(request.session.usuario);
    if (request.session.usuario) {
        console.log("no hay usu");
        next();
    } else {
        console.log("hay usu");
        response.redirect("/login/login.html");
    }
}


login.get("/login.html", function (request, response) {

    response.status(200);
    response.render("login", { errorMsg: null }); // renderiza la pagina login.ejs

});

login.post("/login", function (request, response) { // peticion a la view login.ejs

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

/*
****************************************************************************************************************************************************************
                       CREAR CUENTA
****************************************************************************************************************************************************************                                                                   
*/

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

login.get("/crear_cuenta.html", function (request, response) {

    response.status(200);
    response.render("crear_cuenta", { errorMsg: null }); // renderiza la pagina login.ejs

});

login.post("/crearCuenta", function (request, response) { // peticion a la view login.ejs

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
                    response.redirect("/login/login.html"); // redirecion a la pagina login si no ha habido errores 
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

/*
****************************************************************************************************************************************************************
                LOGOUT USUARIO
****************************************************************************************************************************************************************                                                                   
*/

login.get("/logout", function (request, response) { // desconecta el usuario logueado actualmente
    request.session.destroy();
    console.log("Usuario deslogueado correctamente")
    response.redirect("/login.html");
});


module.exports = login;