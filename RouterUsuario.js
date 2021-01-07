var config = require("./config");
var mysql = require("mysql");
var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");
var session = require("express-session");
var mysqlSession = require("express-mysql-session");
var MySQLStore = mysqlSession(session);
var sessionStore = new MySQLStore(config.mysqlConfig);

var usuario = express.Router();

var DAOUsers = require("./DAOUsers");
var pool = mysql.createPool(config.mysqlConfig);

var daoUser = new DAOUsers(pool);

/*
****************************************************************************************************************************************************************
               PAGINA PRINCIPAL
****************************************************************************************************************************************************************                                                                   
*/
usuario.get("/pag_principal.html", function (request, response) {
    console.log("pagina principal");
    if (request.session.usuario == undefined) {
        response.redirect("/login/login.html");
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
                    id: resultado[0].id_usuario,
                    nombre: resultado[0].nombre,
                    imagen: resultado[0].imagen
                };
                // guardamos los valores del usuario logueado actualmente en variables de sesion

                request.session.idUsuario = usuario.id;
                request.session.nombre = usuario.nombre;
                request.session.imagen = usuario.imagen;

                response.status(200);
                response.render("pag_principal", { perfil: usuario });
            }
        }
    }
});

/*
****************************************************************************************************************************************************************
                            USUARIOS
****************************************************************************************************************************************************************                                                                   
*/

usuario.get("/usuarios.html", function (request, response) {

    if (request.session.usuario == undefined) {
        response.redirect("/login/login.html");
        alert("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        var usuario = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        response.status(200);
        response.render("usuarios", { perfil: usuario });

    }

});

/*
****************************************************************************************************************************************************************
                    PERFIL  USUARIOS
****************************************************************************************************************************************************************                                                                   
*/

usuario.get("/perfil_usu/:idUsuario", function (request, response) {

    if (request.session.usuario == undefined) {
        response.redirect("/login/login.html");
        alert("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        var usuario = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        console.log("id:", request.params.idUsuario);
        daoUser.getUserByID(request.params.idUsuario, cb_getPreguntas);

        function cb_getPreguntas(err, resultado) {

            if (err) {
                response.status(500);
                console.log("ERROR EN LA BASE DE DATOS");
            } else {


                var aux = {
                    nombre: resultado[0].nombre,
                    imagen: resultado[0].imagen,
                    fecha: resultado[0].fecha_alta,
                    preguntas: resultado[0].num_preguntas,
                    respuestas: resultado[0].num_respuestas,
                    reputacion: resultado[0].reputacion,
                    medallas: resultado[0].medallas
                }


                response.render("perfil_usu", { perfil: usuario, bio: aux });

            }
        }
    }

});

module.exports = usuario;