"use strict";

var config = require("../config");
var mysql = require("mysql");
const path = require("path");
//var express = require("express");
//var bodyParser = require("body-parser");
//var fs = require("fs");
//var session = require("express-session");
//var mysqlSession = require("express-mysql-session");
//var MySQLStore = mysqlSession(session);
//var sessionStore = new MySQLStore(config.mysqlConfig);

//var user = express.Router();

var modelRespuestas = require("../models/ModelRespuestas");
var modelPreguntas = require("../models/ModelPreguntas");
//const ControllerUsuario = require("../controllers/ControllerUsers.js");


//const { nextTick } = require("process");
var pool = mysql.createPool(config.mysqlConfig);

var daoRespuestas = new modelRespuestas(pool);
var daoPreguntas = new modelPreguntas(pool);

/*
****************************************************************************************************************************************************************
                    INFOR PREGUNTA
****************************************************************************************************************************************************************                                                                   
*/

function informacion_pregunta(request,response,next){
    if (request.session.usuario == undefined) {
        response.redirect("/usuarios/login.html");
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
                next(error);
            } else {

                daoPreguntas.getEtiquetas(request.params.idPregunta, function (error, res) {
                    if (error) {
                        next(error)
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
                            visitas: resultado[0].visitas+1,
                            nombre: resultado[0].nombre,
                            imagen: resultado[0].imagen,
                            etiqueta: etiqueta
                        }

                        console.log(pregunta);

                        daoRespuestas.countRespuestas(pregunta.id_pregunta, function (e, r) {
                            if (e) {
                                next(e)
                            } else {
                                contador = r[0].TotalRespuestas;
                            }
                        })

                        daoRespuestas.getRespuestaByPregunta(pregunta.id_pregunta, function (err, resul) {

                            if (err) {
                                next(err);
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

                                daoPreguntas.actualizarVisitas(pregunta.visitas,pregunta.id_pregunta,function(e,resultado){
                                    if (e) {
                                        next(e);
                                    } else {
                                        response.render("informacion_pregunta", { pregunta: pregunta, perfil: usuario, respuesta: respuesta, contador: contador });
                                    }
                                     
                                })
                               
                            }

                        })
                    }
                });
            }

        });

    }
}

/*
****************************************************************************************************************************************************************
                RESPONDER PREGUNTA
****************************************************************************************************************************************************************                                                                   
*/

function responder_pregunta(resquest,response,next){
    if (request.session.usuario == undefined) {
        response.redirect("/usuarios/login.html");
        alert("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        var texto = request.body.texto;
        var idPregunta = request.body.id;
        var fecha = new Date();


        //console.log(idPregunta);

        //console.log("id usuario dentro de formular pregunta: " + request.session.idUsuario);
        daoRespuestas.insertRespuesta(idPregunta, request.session.idUsuario, texto, fecha, function (error, resultado) {
            if (error) {
                next(error);
            } else {
                // console.log(resultado);
                response.redirect("/preguntas/preguntas.html");
            }
        });

    }
}

/*
****************************************************************************************************************************************************************
                VOTAR PREGUNTA
****************************************************************************************************************************************************************                                                                   
*/

function votar(request,response,next){
    if (request.session.usuario == undefined) {
        response.redirect("/usuarios/login.html");
        alert("NO ESTAS LOGUEADO, INDIOTA");
    } else {
        var voto; var reputacion;
        var id = request.body.id;

        daoPreguntas.getVotos(id, function (error, resultado) {
            if (error) {
                next(error);
                
                
                
            } else {

                voto = resultado[0].TotalPuntos;

                switch (request.body.voto) {
                    case "ok":
                        voto++;
                        reputacion = 10;
                        break;
                    case "ko":
                        voto--;
                        reputacion = -2;
                        break;
                }

                daoPreguntas.actualizarVotos(id, voto, function (error, resultado) {
                    if (error) {
                        next(error);
                        
                    } else {
                        response.redirect("/preguntas/preguntas.html");
                        //response.redirect("/respuestas/informacion_pregunta/:"+id);
                    }
                })
            }
        })
    }
}

module.exports={
    informacion_pregunta: informacion_pregunta,
    responder_pregunta:responder_pregunta,
    votar:votar
};