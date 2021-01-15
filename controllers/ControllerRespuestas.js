"use strict";

var config = require("../config");
var mysql = require("mysql");
const path = require("path");

var modelRespuestas = require("../models/ModelRespuestas");
var modelPreguntas = require("../models/ModelPreguntas");

var pool = mysql.createPool(config.mysqlConfig);

var daoRespuestas = new modelRespuestas(pool);
var daoPreguntas = new modelPreguntas(pool);

/*
****************************************************************************************************************************************************************
                    INFOR PREGUNTA
****************************************************************************************************************************************************************                                                                   
*/

function medallaVisitas(visitas,medalla){
    
    var texto = ""; 
    var tipo = 0;

    if(visitas == 2){
        texto = "Pregunta Popular";
        tipo = 1;
    }else if(visitas == 4){
        texto = "Pregunta Destacada";
        tipo = 2;
    }else if(visitas == 6){
        texto = "Pregunta Famosa";
        tipo = 3;
    }

    var ok = true;

    if(texto != ""){
        ok = comprobarMedallaRespuesta(texto,tipo,medalla);
    }
    return {ok,texto,tipo};
   
}

function informacion_pregunta(request,response,next){
    if (request.session.usuario == undefined) {
        response.redirect("/usuarios/login.html");
    } else {

        var usuario = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

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

                                var respuesta = [];
                                resul.forEach((r) => {

                                    var votadoRespuesta = false;

                                    daoRespuestas.getVotacionRespuesta(request.session.idUsuario, r.id_respuesta, function(err, res){
                                        if(err)
                                            next(err);
                                        else{
                                            if (res == "") {
                                                votadoRespuesta = false;
                                            }
                                            else {
                                                if (r.id_respuesta != res[0].id_respuesta) {
                                                    votadoRespuesta = false;
                                                }
                                                else {
                                                    votadoRespuesta = true;
                                                }
                                            }

                                            var fecha = new Date(r.fecha_respuesta);
                                            var fechaForm = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear();

                                            var aux = {
                                                id_respuesta: r.id_respuesta,
                                                texto: r.texto,
                                                id_usuario: r.id_usuario,
                                                fecha_respuesta: fechaForm,
                                                nombre: r.nombre,
                                                imagen: r.imagen,
                                                votadoRespuesta: votadoRespuesta
                                            }
                                            respuesta.push(aux);

                                        }
                                    });
                                    
                                })

                                daoPreguntas.actualizarVisitas(pregunta.visitas,pregunta.id_pregunta,function(error,resultado){
                                    if (error) {
                                        next(error);
                                    } else {
                                               
                                        daoPreguntas.getDatosVisitas(pregunta.id_pregunta,function(error,resultado){
                                            if(error){
                                                next(error);
                                            }else{

                                                let medalla = [];
                                                resultado.forEach(element => medalla.push({
                                                    merito: element.merito,
                                                    tipo: element.tipo
                                                }));
                
                                                var x = medallaVisitas(pregunta.visitas,medalla);
 
                                                daoPreguntas.insertarMedallaPregunta(pregunta.id_pregunta,pregunta.id_usuario,x.texto,x.tipo,new Date(),function(error,resultado){
                                                    if(error){
                                                        next(error); 
                                                    } else{
                                                        var votadoPregunta = true;
                                                        daoPreguntas.getVotacionPregunta(request.session.idUsuario, pregunta.id_pregunta, function(err, res){
                                                            if(err)
                                                                next(err);
                                                            else{
                                                                if (res == ""){
                                                                    votadoPregunta = false;
                                                                }
                                                                else {
                                                                    if (pregunta.id_pregunta != res[0].id_pregunta){
                                                                        votadoPregunta = false;
                                                                    }
                                                                    else {
                                                                        votadoPregunta = true;
                                                                    }
                                                                }
                                                                response.render("informacion_pregunta", { pregunta: pregunta, perfil: usuario, respuesta: respuesta, contador: contador, votadoPregunta: votadoPregunta });
                                                            } 
                                                        });
                                                    }
                                                })                  
                                            }
                                        })
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
    } else {

        var texto = request.body.texto;
        var idPregunta = request.body.id;
        var fecha = new Date();

        daoRespuestas.insertRespuesta(idPregunta, request.session.idUsuario, texto, fecha, function (error, resultado) {
            if (error) {
                next(error);
            } else {
                response.redirect("/preguntas/preguntas.html");
            }
        });
    }
}

/*
****************************************************************************************************************************************************************
                VOTAR RESPUESTA
****************************************************************************************************************************************************************                                                                   
*/

function comprobarMedallaRespuesta(texto,tipo,medalla){

    var ok = false;
    for(var i = 0; i < medalla.length; i++){
        if(medalla[i].merito == texto && medalla[i].categoria == tipo){
            ok = true;
        }
    }
    return ok;     
}

function medallaRespuesta(puntos,medalla){
    var texto = ""; 
    var tipo = 0;
    if(puntos == 2){
        texto = "Respuesta Interesante";
        tipo = 1;
    }else if(puntos == 4){
        texto = "Buena Respuesta";
        tipo = 2;
    }else if(puntos == 6){
        texto = "Excelente Respuesta";
        tipo = 3;
    }

    var ok = true;

    if(texto != ""){
        ok = comprobarMedallaRespuesta(texto,tipo,medalla);
    }

    return {ok,texto,tipo};
   
}

function votar_respuesta(request,response,next){
    if (request.session.usuario == undefined) {
        response.redirect("/usuarios/login.html");
    } else {
        
        var id = request.body.idRespuesta; //id respuesta
        daoRespuestas.getDatosVotarRespuestas(id, function (error, datos) {
            if (error) 
                next(error);
             else {
                
                var voto = datos.total_puntos;
                var idUser = datos.id_usuario;
                var idPre = datos.id_pregunta;
                var reputacion = datos.reputacion;
                let medalla = [];

                datos.resul.forEach(element => medalla.push({
                    merito: element.merito,
                    tipo: element.tipo
                }));

                switch (request.body.voto) {
                    case "ok":
                        voto++;
                        reputacion = reputacion + 10;
                        //si es false, es decir, no existe ese merito para esa pregunta, se inserta en la base de datos
                        var x = medallaRespuesta(voto,medalla);
                        if(x.ok == false){
                            daoRespuestas.insertarMedallaRespuesta(id,idUser,x.texto,x.tipo,new Date(),function(error,resultado){
                                if(error)
                                    next(error); 
                            })
                        }
                        
                        break;
                    case "ko":
                        voto--;
                        reputacion = reputacion - 2;
                        if (reputacion < 1) {
                            reputacion = 1;
                        }
                        break;
                }


                daoRespuestas.insertVotacionRespuesta(request.session.idUsuario, id, function(err, res){
                    if(err)
                        next(err);
                    else{
                        daoRespuestas.actualizarDatosRespuestas(id, idUser, voto, reputacion, function (error, resultado) {
                            if (error)
                                next(error);
                            else {
                                response.redirect("/respuestas/informacion_pregunta/" + idPre);
                            }

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
    votar_respuesta:votar_respuesta
};