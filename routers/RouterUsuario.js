var config = require(".././config");
var mysql = require("mysql");
var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");
var session = require("express-session");
var mysqlSession = require("express-mysql-session");
var MySQLStore = mysqlSession(session);
var sessionStore = new MySQLStore(config.mysqlConfig);

var user = express.Router();

<<<<<<< HEAD:routers/RouterUsuario.js
var DAOUsers = require(".././models/DAOUsers");
const ControllerUsuario = require("../controllers/ControllerUsuario.js");

=======
var DAOUsers = require("./DAOUsers");
const DAOEtiquetas = require("./DAOEtiquetas");
const { nextTick } = require("process");
>>>>>>> cd0440382384c5f029dc246c7e584cd0bdc0a688:RouterUsuario.js
var pool = mysql.createPool(config.mysqlConfig);

var daoUser = new DAOUsers(pool);
var daoEtiquetas= new DAOEtiquetas(pool);

/*
****************************************************************************************************************************************************************
               PAGINA PRINCIPAL
****************************************************************************************************************************************************************                                                                   
*/
user.get("/pag_principal.html", function (request, response, next) {
    console.log("pagina principal");
    if (request.session.usuario == undefined) {
        response.redirect("/login/login.html");
        alert("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        response.locals.email = request.session.usuario;

        daoUser.getUser(response.locals.email, cb_getUser);

        function cb_getUser(error, resultado) {
            if (error) {
                next(error);
                /*response.status(500);
                console.log("ERROR EN LA BASE DE DATOS");*/
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

user.get("/usuarios.html", function (request, response) {

    if (request.session.usuario == undefined) {
        response.redirect("/login/login.html");
        alert("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        var perfil = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        daoUser.getAllUser(function(error,resultado){
            if (error) {
                next();
            } else {

                var usuario=[];

                resultado.forEach((u) => {
                    //console.log("foreach");
                    daoEtiquetas.getEtiquetaUser(u.id_usuario, function (err, resul) {

                        if (err) {
                            response.status(500);
                            console.log("ERROR EN LA BASE DE DATOS"+ err);
                        } else {

                            /*console.log(p.id_pregunta);
                            var etiqueta = [];
                            for (var x of resul) {
                                etiqueta.push(x.etiqueta);
                            }*/
                            var aux = {
                                id_usuario: u.id_usuario,
                                nombre: u.nombre,
                                imagen: u.imagen,
                                reputacion:u.reputacion,
                               etiqueta: resul
                            }
                            console.log(aux);
                            usuario.push(aux);

                            //console.log(pregunta);
                        }

                    })


                })

                
                console.log(usuario);
                response.render("usuarios", { perfil: perfil, usuario:usuario });
            }
        })

        
        

    }

});

/*
****************************************************************************************************************************************************************
                    PERFIL  USUARIOS
****************************************************************************************************************************************************************                                                                   
*/

user.get("/perfil_usu/:idUsuario", function (request, response) {

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

                var fecha = new Date(resultado[0].fecha_alta);
                var fechaForm = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear();

                var aux = {
                    nombre: resultado[0].nombre,
                    imagen: resultado[0].imagen,
                    fecha:fechaForm,
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

module.exports = user;