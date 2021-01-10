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
var modelUsuarios = require("../models/ModelUsers");
//const ControllerUsuario = require("../controllers/ControllerUsers.js");


//const { nextTick } = require("process");
var pool = mysql.createPool(config.mysqlConfig);

var daoRespuestas = new modelRespuestas(pool);
var daoPreguntas = new modelPreguntas(pool);
var daoUsuarios = new modelUsuarios(pool);

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

                        var fecha = new Date(resultado[0].fecha);
                        var fechaForm = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear();

                        var pregunta = {
                            id_pregunta: resultado[0].id_pregunta,
                            id_usuario: resultado[0].id_usuario,
                            titulo: resultado[0].titulo,
                            cuerpo: resultado[0].cuerpo,
                            fecha: fechaForm,
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

                                    var fecha = new Date(r.fecha_respuesta);
                                    var fechaForm = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear();

                                    var aux = {
                                        texto: r.texto,
                                        fecha_respuesta: fechaForm,
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

function responder_pregunta(request,response,next){
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
        var idUser;

        daoPreguntas.getVotosAndIdUser(id, function (error, resultado) {
            if (error) 
                next(error);
             else {

                voto = resultado[0].TotalPuntos;
                idUser = resultado[0].id_usuario;

                daoUsuarios.getReputacion(idUser, function(error, resultado){
                    if(error)
                        next(error);
                    else{
                        reputacion = resultado[0].reputacion;
                        switch (request.body.voto) {
                            case "ok":
                                voto++;
                                reputacion = reputacion + 10;
                                break;
                            case "ko":
                                voto--;
                                reputacion = reputacion - 2;
                                if (reputacion < 1) {
                                    reputacion = 1;
                                }
                                break;
                        }

                        daoPreguntas.actualizarVotos(id, voto, function (error, resultado) {
                            if (error)
                                next(error);
                            else {
                                console.log("reputacion antes de enviar: " + reputacion);
                                daoUsuarios.actualizarReputacion(idUser, reputacion, function (error, resultado) {
                                    if (error)
                                        next(error);
                                    else
                                        response.redirect("/preguntas/preguntas.html");
                                });
                            }
                            //response.redirect("/preguntas/preguntas.html");
                            //response.redirect("/respuestas/informacion_pregunta/:"+id);
                        });
                    }
                });
                
                
                
            }
        })
    }
}

module.exports={
    informacion_pregunta: informacion_pregunta,
    responder_pregunta:responder_pregunta,
    votar:votar
};