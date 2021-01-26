"use strict";

var config = require("../config");
var mysql = require("mysql");
const path = require("path");

var modelPreguntas = require("../models/ModelPreguntas");

var pool = mysql.createPool(config.mysqlConfig);

var daoPreguntas = new modelPreguntas(pool);

/*
****************************************************************************************************************************************************************
                PREGUNTAS
****************************************************************************************************************************************************************                                                                   
*/

function text_truncate(str, length, ending) {
    if (ending == null) {
        ending = '...';
    }
    if (str.length > length) {
        return str.substring(0, length - ending.length) + ending;
    } else {
        return str;
    }
};

function preguntas(request,response,next){
    /*if (request.session.usuario == undefined) {
        response.redirect("/usuarios/login.html");
    } else {*/

        var usuario = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        daoPreguntas.getPreguntas(function (error, resultado) {

            if (error) {
                next(error);
            } else {

                let pregunta=[];
                resultado.forEach((p) => {
                    
                    var fecha = new Date(p.fecha);
                    var fechaForm = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear();

                    var aux = {
                        id_pregunta: p.id_pregunta,
                        id_usuario: p.id_usuario,
                        titulo: p.titulo,
                        cuerpo: text_truncate(p.cuerpo, 150),
                        fecha: fechaForm,
                        nombre: p.nombre,
                        imagen: p.imagen
                    }
                    pregunta.push(aux);
                })

                daoPreguntas.getAllEtiquetas(function(error,etiqueta){

                    if(error)
                        next(error);
                    else{
                        daoPreguntas.count(function (error, res) {
                            if (error) 
                                next(error);
                            else{
                                var contador = res[0].Total;
                                response.render("preguntas", { perfil: usuario, pregunta: pregunta, etiqueta:etiqueta, contador:contador });
                            }   
                        })  
                    }
                })       
            }
        })
   // }
};

/*
****************************************************************************************************************************************************************
                FORMULAR PREGUNTA
****************************************************************************************************************************************************************                                                                   
*/

function acceso_formular_pregunta(request,response){
    if (request.session.usuario == undefined) {
        response.redirect("/usuarios/login.html");
    } else {

        var usuario = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };
        response.render("formular_pregunta", { perfil: usuario });
    }
}

function formular_pregunta(request,response,next){
    if (request.session.usuario == undefined) {
        response.redirect("/usuarios/login.html");
    } else {
        var id_usuario= request.session.idUsuario;
        var titulo = request.body.titulo;
        var cuerpo = request.body.cuerpo;
        var etiqueta = request.body.etiqueta;
        var fecha = new Date();

        var aux = [];

        if (etiqueta != "") {
            var etiquetas = etiqueta.split("@");
            for (var i = 0; i < 6; i++) {
                if (etiquetas[i] != "" && etiquetas[i] != undefined) {
                    aux.push(etiquetas[i]);
                }
            }
        }
        
        daoPreguntas.insertPregunta(request.session.idUsuario, titulo, cuerpo, fecha, cb_insertPregunta);

        function cb_insertPregunta(err, resultado) {
            if (err) {
                next(err);
            } else if (resultado.length != 0) {
                if (aux.length > 0) {

                    daoPreguntas.getUltimoID(cb_getUltimoID);

                    function cb_getUltimoID(err, res) {
                        if (err) {
                            next(err);
                        } else if (res.length != 0) {

                            var id = res[0].id_pregunta;

                            for (var i = 0; i < aux.length; i++) {
                                daoPreguntas.insertEtiqueta(aux[i], id,id_usuario, cb_insertEtiquetas);

                                function cb_insertEtiquetas(err, res2) {
                                    if (err) {
                                        next(err);
                                    }
                                }
                            }
                        }
                    }
                }
                response.redirect("/preguntas/preguntas.html");
            }
        }
    }
}

/*
****************************************************************************************************************************************************************
                    SIN RESPONDER
****************************************************************************************************************************************************************                                                                   
*/

function sin_responder(request,response,next){
    if (request.session.usuario == undefined) {
        response.redirect("/usuarios/login.html");
    } else {

        var usuario = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        daoPreguntas.getPreguntasSinResponder(function (error, resultado) {

            if (error) {
                next(error);
            } else {

                var pregunta = [];

                resultado.forEach((p) => {
                          
                    var fecha = new Date(p.fecha);
                    var fechaForm = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear();

                    var aux = {
                        id_pregunta: p.id_pregunta,
                        id_usuario: p.id_usuario,
                        titulo: p.titulo,
                        cuerpo: text_truncate(p.cuerpo, 150),
                        fecha: fechaForm,
                        nombre: p.nombre,
                        imagen: p.imagen
                    }
                    pregunta.push(aux);    
                })

                daoPreguntas.getAllEtiquetas(function (err, etiqueta) {

                    if (err) {
                        next(err);
                    } else {
                        daoPreguntas.countSinResponder(function (error, res) {
                            if (error) {
                                next(error);
                            } else {
                                var contador = res[0].TotalSinResponder;
                                response.render("sin_responder", { perfil: usuario, contador: contador, pregunta: pregunta, etiqueta:etiqueta });
                            }
                        })
                    }
                });
            }
        })
    }
}

/*
****************************************************************************************************************************************************************
                FILTRAR POR ETIQUETA
****************************************************************************************************************************************************************                                                                   
*/

function filtrar_etiqueta(request,response,next){
    if (request.session.usuario == undefined) {
        response.redirect("/usuarios/login.html");
    } else {

        var usuario = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        var filtro = request.params.Etiqueta;

        daoPreguntas.getPreguntasByEtiqueta(filtro, function (error, resultado) {
            if (error) {
                next(error);
            } else {

                var pregunta = [];

                resultado.forEach((p) => {
                    var fecha = new Date(p.fecha);
                    var fechaForm = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear();

                    var aux = {
                        id_pregunta: p.id_pregunta,
                        id_usuario: p.id_usuario,
                        titulo: p.titulo,
                        cuerpo: text_truncate(p.cuerpo, 150),
                        fecha: fechaForm,
                        nombre: p.nombre,
                        imagen: p.imagen
                    }
                    pregunta.push(aux);

                });

                daoPreguntas.getAllEtiquetas(function (err, etiqueta) {

                    if (err) {
                        next(err);
                    } else {

                        daoPreguntas.countEtiquetas(request.params.Etiqueta, function (error, res) {
                            if (error) {
                                next(error);
                            } else {
                                var contador = res[0].TotalEtiquetas;
                                response.render("filtrar_etiqueta", { perfil: usuario, etiqueta: etiqueta, contador: contador, pregunta: pregunta, filtro:filtro });
                                
                            }
                        })
                    }
                })
            }
        })
    }
}

/*
****************************************************************************************************************************************************************
                FILTRAR POR TEXTO
****************************************************************************************************************************************************************                                                                   
*/

function filtrar_texto(request,response,next){
    if (request.session.usuario == undefined) {
        response.redirect("/usuarios/login.html");
    } else {

        var usuario = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        var texto = request.body.search;

        daoPreguntas.getPreguntasPorTexto(texto, function (error, resultado) {

            if (error) {
                next(error);
            } else {

                var pregunta = [];

                resultado.forEach((p) => {
                    var fecha = new Date(p.fecha);
                    var fechaForm = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear();

                    var aux = {
                        id_pregunta: p.id_pregunta,
                        id_usuario: p.id_usuario,
                        titulo: p.titulo,
                        cuerpo: text_truncate(p.cuerpo, 150),
                        fecha: fechaForm,
                        nombre: p.nombre,
                        imagen: p.imagen
                    }
                    pregunta.push(aux);
                })

                daoPreguntas.getAllEtiquetas(function (err, etiqueta) {

                    if (err) {
                        next(err);
                    } else {
                        daoPreguntas.countTexto(texto, function (error, res) {
                            if (error) {
                                next(error);
                            } else {
                                var contador = res[0].TotalTexto;                         
                                response.render("filtrar_texto", { perfil: usuario, texto: texto, contador: contador, pregunta: pregunta, etiqueta:etiqueta });        
                            }
                        })
                    }
                })
            }
        });
    }
}

/*
****************************************************************************************************************************************************************
                VOTAR PREGUNTA
****************************************************************************************************************************************************************                                                                   
*/

function comprobarMedallaPregunta(texto,tipo,medalla){

    var ok = false;
    for(var i = 0; i < medalla.length; i++){
        if(medalla[i].merito == texto && medalla[i].categoria == tipo){
            ok = true;
        }
    }
    return ok;     
}

function medallaPregunta(puntos,medalla){
    var texto = ""; 
    var tipo = 0;

    if(puntos == 1){
        texto = "Estudiante";
        tipo = 1;
    }else if(puntos == 2){
        texto = "Pregunta Interesante";
        tipo = 1;
    }else if(puntos == 4){
        texto = "Buena Pregunta";
        tipo = 2;
    }else if(puntos == 6){
        texto = "Excelente Pregunta";
        tipo = 3;
    }

    var ok = true;

    if(texto != ""){
        ok = comprobarMedallaPregunta(texto,tipo,medalla);
    }

    return {ok,texto,tipo};
}

function votar_pregunta(request,response,next){
    if (request.session.usuario == undefined) {
        response.redirect("/usuarios/login.html");
    } else {
        
        var id = request.body.id;

        daoPreguntas.getDatosVotarPreguntas(id, function (error, datos) {
            if (error) 
                next(error);
             else {
                
                var voto = datos.total_puntos;
                var idUser = datos.id_usuario;
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
                        var x = medallaPregunta(voto,medalla);
                        if(x.ok == false){
                            daoPreguntas.insertarMedallaPregunta(id,idUser,x.texto,x.tipo,new Date(),function(error,resultado){
                                if(error){
                                    next(error); 
                                }      
                            });
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

                daoPreguntas.insertVotacionPregunta(request.session.idUsuario, id, function(err, res){
                    if (err)
                        next(err);
                    else {
                        daoPreguntas.actualizarDatosPreguntas(id, idUser, voto, reputacion, function (error, resultado) {
                            if (error)
                                next(error);
                            else {
                                response.redirect("/respuestas/informacion_pregunta/" + id);
                            }
                        });
                    }
                }); 
            }
        })
    }
}

module.exports={
    preguntas:preguntas,
    acceso_formular_pregunta: acceso_formular_pregunta,
    formular_pregunta:formular_pregunta,
    sin_responder:sin_responder,
    filtrar_etiqueta:filtrar_etiqueta,
    filtrar_texto:filtrar_texto,
    votar_pregunta:votar_pregunta
}