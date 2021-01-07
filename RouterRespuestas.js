var config = require("./config");
var mysql = require("mysql");
var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");
var session = require("express-session");
var mysqlSession = require("express-mysql-session");
var MySQLStore = mysqlSession(session);
var sessionStore = new MySQLStore(config.mysqlConfig);

var respuestas = express.Router();

var DAOPreguntas = require("./DAOPreguntas");
var DAOEtiquetas = require("./DAOEtiquetas");
var DAORespuestas = require("./DAORespuestas");

var pool = mysql.createPool(config.mysqlConfig);

var daoPreguntas = new DAOPreguntas(pool);
var daoEtiquetas = new DAOEtiquetas(pool);
var daoRespuestas = new DAORespuestas(pool);

/*
****************************************************************************************************************************************************************
                    INFOR PREGUNTA
****************************************************************************************************************************************************************                                                                   
*/

respuestas.get("/informacion_pregunta/:idPregunta", function (request, response) {

    if (request.session.usuario == undefined) {
        response.redirect("/login/login.html");
        alert("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        var usuario = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        console.log(request.params.idPregunta);
        daoPreguntas.getPreguntaInformacion(request.params.idPregunta, function (error, resultado) {

            if (error) {
                response.status(500);
                console.log("ERROR EN LA BASE DE DATOS");
            } else {

                daoEtiquetas.getEtiquetas(request.params.idPregunta, function (error, res) {
                    if (error) {
                        response.status(500);
                        console.log("ERROR EN LA BASE DE DATOS");
                    } else {

                        var etiqueta = [];
                        var contador;

                        for (var i of res) {
                            etiqueta.push(i.etiqueta);
                        }

                        console.log(resultado);
                        var pregunta = {
                            id_pregunta: resultado[0].id_pregunta,
                            id_usuario: resultado[0].id_usuario,
                            titulo: resultado[0].titulo,
                            cuerpo: resultado[0].cuerpo,
                            fecha: resultado[0].fecha,
                            nombre: resultado[0].nombre,
                            imagen: resultado[0].imagen,
                            etiqueta: etiqueta
                        }

                        daoRespuestas.countRespuestas(pregunta.id_pregunta, function (e, r) {
                            if (error) {
                                response.status(500);
                                console.log("ERROR EN LA BASE DE DATOS");
                            } else {
                                contador = r[0].TotalRespuestas;
                            }
                        })

                        daoRespuestas.getRespuestaByPregunta(pregunta.id_pregunta, function (err, resul) {

                            if (error) {
                                response.status(500);
                                console.log("ERROR EN LA BASE DE DATOS");
                            } else {

                                console.log(resul);
                                var respuesta = [];
                                resul.forEach((r) => {

                                    var aux = {
                                        texto: r.texto,
                                        fecha_respuesta: r.fecha_respuesta,
                                        nombre: r.nombre,
                                        imagen: r.imagen
                                    }
                                    respuesta.push(aux);
                                })

                                console.log(respuesta);
                                response.render("informacion_pregunta", { pregunta: pregunta, perfil: usuario, respuesta: respuesta, contador: contador });

                            }

                        })
                    }
                });
            }

        });

    }
});

/*
****************************************************************************************************************************************************************
                RESPONDER PREGUNTA
****************************************************************************************************************************************************************                                                                   
*/

respuestas.post("/responderPregunta", function (request, response) {

    if (request.session.usuario == undefined) {
        response.redirect("/login/login.html");
        alert("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        var texto = request.body.texto;
        var idPregunta = request.body.id;
        var fecha = new Date();


        console.log(idPregunta);

        //console.log("id usuario dentro de formular pregunta: " + request.session.idUsuario);
        daoRespuestas.insertRespuesta(idPregunta, request.session.idUsuario, texto, fecha, function (error, resultado) {
            if (error) {
                response.status(500);
                console.log("ERROR BBDD" + error);
            } else {
                // console.log(resultado);
                response.redirect("/preguntas.html");
            }
        });

    }
});

module.exports = respuestas;