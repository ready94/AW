"use strict";

var config = require("../config");
var mysql = require("mysql");
const path = require("path");

var modelRespuestas = require("../models/ModelRespuestas");
var modelPreguntas = require("../models/ModelPreguntas");
var modelUsuarios = require("../models/ModelUsers");

var pool = mysql.createPool(config.mysqlConfig);

var daoRespuestas = new modelRespuestas(pool);
var daoPreguntas = new modelPreguntas(pool);
var daoUsuarios = new modelUsuarios(pool);

/*
****************************************************************************************************************************************************************
                    INFOR PREGUNTA
****************************************************************************************************************************************************************                                                                   
*/

function medallaVisitas(visitas,medalla){
    var texto=""; var tipo=0;
    if(visitas==2){
        texto="Pregunta Popular";
        tipo=1;
    }else if(visitas==4){
        texto="Pregunta Destacada";
        tipo=2;
    }else if(visitas==6){
        texto="Pregunta Famosa";
        tipo=3;
    }

    //console.log("comprobar medalla");
    console.log("merito",texto);
    var ok=true;
    if(texto!=""){
        ok=comprobarMedallaRespuesta(texto,tipo,medalla);
        //console.log(ok);
    }
    //console.log(ok);
    return {ok,texto,tipo};
   
}

function informacion_pregunta(request,response,next){
    if (request.session.usuario == undefined) {
        response.redirect("/usuarios/login.html");
        console.log("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        var usuario = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        //console.log(request.params.idPregunta);


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

                        //console.log(resultado);

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

                        //console.log(pregunta);

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

                                //console.log(resul);
                                var respuesta = [];
                                resul.forEach((r) => {

                                    var fecha = new Date(r.fecha_respuesta);
                                    var fechaForm = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear();

                                    var aux = {
                                        id_respuesta: r.id_respuesta,
                                        texto: r.texto,
                                        fecha_respuesta: fechaForm,
                                        nombre: r.nombre,
                                        imagen: r.imagen
                                    }
                                    respuesta.push(aux);
                                })

                                //console.log(respuesta);
                                console.log("actualizar visitas");
                                daoPreguntas.actualizarVisitas(pregunta.visitas,pregunta.id_pregunta,function(error,resultado){
                                    if (error) {
                                        next(error);
                                    } else {
                                               
                                        daoPreguntas.getDatosVisitas(pregunta.id_pregunta,function(error,resultado){
                                            if(error){
                                                next(error);
                                            }else{

                                                let medalla=[];
                                                resultado.forEach(element => medalla.push({
                                                    merito: element.merito,
                                                    tipo: element.tipo
                                                }));
                
                                                var x = medallaVisitas(pregunta.visitas,medalla);
 
                                                console.log("esto vaaaaa a petaaar:");
                                                console.log(pregunta.id_pregunta,x.texto,x.tipo);
                                                daoPreguntas.insertarMedallaPregunta(pregunta.id_pregunta,new Date(),x.texto,x.tipo,function(error,resultado){
                                                    if(error){
                                                        console.log("error");
                                                        next(error); 
                                                    } else{
                                                        var votado = true;
                                                        daoPreguntas.getVotacionPregunta(request.session.idUsuario, pregunta.id_pregunta, function(err, res){
                                                            if(err)
                                                                next(err);
                                                            else{
                                                                if (res == ""){
                                                                    votado = false;
                                                                }
                                                                else {
                                                                    if (pregunta.id_pregunta != res[0].id_pregunta){
                                                                        votado = false;
                                                                    }
                                                                    else {
                                                                        console.log("render");
                                                                        votado = true;
                                                                    }
                                                                }
                                                                
                                                                console.log("votado: " + votado);
                                                                response.render("informacion_pregunta", { pregunta: pregunta, perfil: usuario, respuesta: respuesta, contador: contador, votado: votado });
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
        console.log("NO ESTAS LOGUEADO, INDIOTA");
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
                VOTAR RESPUESTA
****************************************************************************************************************************************************************                                                                   
*/

function comprobarMedallaRespuesta(texto,tipo,medalla){
    console.log(medalla);
    var ok=false;
    for(var i=0; i< medalla.length;i++){
        if(medalla[i].merito==texto && medalla[i].categoria==tipo){
            ok=true;
        }
    }
    console.log("comprobar:",ok);
    return ok;     
}

function medallaRespuesta(puntos,medalla){
    var texto=""; var tipo=0;
    if(puntos==2){
        texto="Respuesta Interesante";
        tipo=1;
    }else if(puntos==4){
        texto="Buena Respuesta";
        tipo=2;
    }else if(puntos==6){
        texto="Excelente Respuesta";
        tipo=3;
    }

    //console.log("comprobar medalla");
    console.log("merito",texto);
    var ok=true;
    if(texto!=""){
        ok=comprobarMedallaRespuesta(texto,tipo,medalla);
        console.log(ok);
    }
    console.log(ok);
    return {ok,texto,tipo};
   
}

function votar_respuesta(request,response,next){
    if (request.session.usuario == undefined) {
        response.redirect("/usuarios/login.html");
        console.log("NO ESTAS LOGUEADO, INDIOTA");
    } else {
        
        var id = request.body.idRespuesta; //id respuesta
        console.log(id);
        daoRespuestas.getDatosVotarRespuestas(id, function (error, datos) {
            if (error) 
                next(error);
             else {
                //console.log(datos);
                
                var voto=datos.total_puntos;
                var idUser= datos.id_usuario;
                var idPre= datos.id_pregunta;
                var reputacion = datos.reputacion;
                let medalla=[];
                datos.resul.forEach(element => medalla.push({
                    merito: element.merito,
                    tipo: element.tipo
                }));

                //console.log(request.body.voto);
                switch (request.body.voto) {
                    case "ok":
                        voto++;
                        reputacion = reputacion + 10;
                        //console.log("medalla");
                        //si es false, es decir, no existe ese merito para esa pregunta, se inserta en la base de datos
                        var x = medallaRespuesta(voto,medalla);
                        if(x.ok==false){
                            daoRespuestas.insertarMedallaRespuesta(id,new Date(),x.texto,x.tipo,function(error,resultado){
                                if(error)
                                    next(error); 
                            })
                        }
                        
                        //console.log("paso medalla");
                        break;
                    case "ko":
                        voto--;
                        reputacion = reputacion - 2;
                        if (reputacion < 1) {
                            reputacion = 1;
                        }
                        break;
                }

                daoRespuestas.actualizarDatosRespuestas(id, idUser,voto, reputacion,function (error, resultado) {
                    if (error)
                        next(error);
                    else {
                        console.log("reputacion antes de enviar: " + reputacion); 
                        //response.redirect("/preguntas/preguntas.html");   
                        response.redirect("/respuestas/informacion_pregunta/"+idPre);
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