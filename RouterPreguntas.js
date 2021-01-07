var config = require("./config");
var mysql = require("mysql");
var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");
var session = require("express-session");
var mysqlSession = require("express-mysql-session");
var MySQLStore = mysqlSession(session);
var sessionStore = new MySQLStore(config.mysqlConfig);

var preguntas = express.Router();

var DAOPreguntas = require("./DAOPreguntas");
var DAOEtiquetas = require("./DAOEtiquetas");

var pool = mysql.createPool(config.mysqlConfig);

var daoPreguntas = new DAOPreguntas(pool);
var daoEtiquetas = new DAOEtiquetas(pool);

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

preguntas.get("/preguntas.html", function (request, response) {
    if (request.session.usuario == undefined) {
        response.redirect("/login/login.html");
        alert("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        var usuario = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        //----------- contador
        var contador;
        daoPreguntas.getPreguntas(function (error, resultado) {

            if (error) {
                response.status(500);
                console.log("ERROR EN LA BASE DE DATOS");
            } else {

                var pregunta = [];

                resultado.forEach((p) => {
                    daoEtiquetas.getEtiquetas(p.id_pregunta, function (err, resul) {

                        if (err) {
                            response.status(500);
                            console.log("ERROR EN LA BASE DE DATOS");
                        } else {

                            console.log(p.id_pregunta);
                            var etiqueta = [];
                            for (var x of resul) {
                                etiqueta.push(x.etiqueta);
                            }

                            var fecha = new Date(p.fecha);
                            var fechaForm = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear();

                            var aux = {
                                id_pregunta: p.id_pregunta,
                                id_usuario: p.id_usuario,
                                titulo: p.titulo,
                                cuerpo: text_truncate(p.cuerpo, 150),
                                fecha: fechaForm,
                                nombre: p.nombre,
                                imagen: p.imagen,
                                etiqueta: etiqueta
                            }
                            pregunta.push(aux);

                            //console.log(pregunta);
                        }

                    })
                })

                daoPreguntas.count(function (e, res) {
                    if (error) {
                        response.status(500);
                        console.log("ERROR EN LA BASE DE DATOS");
                    } else {

                        contador = res[0].Total;
                        //response.status(200);
                        response.render("preguntas", { perfil: usuario, contador: contador, pregunta: pregunta });
                        //console.log("despues del render");
                    }
                })

            }
        });

    }
});

/*
****************************************************************************************************************************************************************
                FORMULAR PREGUNTA
****************************************************************************************************************************************************************                                                                   
*/
preguntas.get("/formular_pregunta.html", function (request, response) {

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
        response.render("formular_pregunta", { perfil: usuario });

    }

});

//**************************************************************************************************************************************************************

preguntas.post("/crearPregunta", function (request, response) {

    if (request.session.usuario == undefined) {
        response.redirect("/login/login.html");
        alert("NO ESTAS LOGUEADO, INDIOTA");
    } else {
        var titulo = request.body.titulo;
        var cuerpo = request.body.cuerpo;
        var etiqueta = request.body.etiqueta;
        var fecha = new Date();


        // console.log(fecha);
        var aux = [];

        if (etiqueta != "") {
            var etiquetas = etiqueta.split("@");
            for (var i = 0; i < 5; i++) {
                if (etiquetas[i] != "" && etiquetas[i] != undefined) {
                    aux.push(etiquetas[i]);
                }
            }
        }
        console.log("id usuario dentro de formular pregunta: " + request.session.idUsuario);
        daoPreguntas.insertPregunta(request.session.idUsuario, titulo, cuerpo, fecha, cb_insertPregunta);

        function cb_insertPregunta(err, resultado) {
            if (err) {
                response.status(500);
                console.log("ERROR BBDD" + err);
            } else if (resultado.length != 0) {
                if (aux.length > 0) {

                    daoEtiquetas.getUltimoID(cb_getUltimoID);

                    function cb_getUltimoID(err, res) {
                        if (err) {
                            response.status(500);
                            console.log("ERROR BBDD" + err);
                        } else if (res.length != 0) {

                            var id = res[0].id_pregunta;

                            for (var i = 0; i < aux.length; i++) {
                                daoEtiquetas.insertEtiqueta(aux[i], id, cb_insertEtiquetas);

                                function cb_insertEtiquetas(err, res2) {
                                    if (err) {
                                        response.status(500);
                                        console.log("ERROR BBDD" + err); //comen
                                    }
                                    /*else {
                                        response.status(200);
                                        response.redirect("/preguntas.html");
                                    }*/
                                }
                            }
                        }
                    }
                }
                /* else {
                     response.status(200);
                     response.redirect("/preguntas.html");
                 }*/

                //response.status(200);
                response.redirect("/preguntas.html");

            }
        }
    }
});

/*
****************************************************************************************************************************************************************
                    SIN RESPONDER
****************************************************************************************************************************************************************                                                                   
*/

preguntas.get("/sin_responder.html", function (request, response) {

    if (request.session.usuario == undefined) {
        response.redirect("/login/login.html");
        alert("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        var usuario = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        var contador;
        daoPreguntas.getPreguntasSinResponder(function (error, resultado) {

            if (error) {
                response.status(500);
                console.log("ERROR EN LA BASE DE DATOS");
            } else {

                var pregunta = [];

                resultado.forEach((p) => {
                    daoEtiquetas.getEtiquetas(p.id_pregunta, function (err, resul) {

                        if (err) {
                            response.status(500);
                            console.log("ERROR EN LA BASE DE DATOS");
                        } else {

                            //console.log(p.id_pregunta);
                            var etiqueta = [];
                            for (var x of resul) {
                                etiqueta.push(x.etiqueta);
                            }

                            var fecha = new Date(p.fecha);
                            var fechaForm = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear();

                            var aux = {
                                id_pregunta: p.id_pregunta,
                                id_usuario: p.id_usuario,
                                titulo: p.titulo,
                                cuerpo: text_truncate(p.cuerpo, 150),
                                fecha: fechaForm,
                                nombre: p.nombre,
                                imagen: p.imagen,
                                etiqueta: etiqueta
                            }
                            pregunta.push(aux);

                            //console.log(pregunta);
                        }

                    })
                })

                daoPreguntas.countSinResponder(function (e, res) {
                    if (error) {
                        response.status(500);
                        console.log("ERROR EN LA BASE DE DATOS");
                    } else {

                        contador = res[0].TotalSinResponder;
                        //response.status(200);
                        console.log(pregunta);
                        response.render("sin_responder", { perfil: usuario, contador: contador, pregunta: pregunta });
                    }
                })

            }
        });

    }

});


/*
****************************************************************************************************************************************************************
                FILTRAR POR ETIQUETA
****************************************************************************************************************************************************************                                                                   
*/

preguntas.get("/filtrar_etiqueta/:Etiqueta", function (request, response) {

    if (request.session.usuario == undefined) {
        response.redirect("/login/login.html");
        alert("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        var usuario = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        var etiqueta = request.params.Etiqueta;
        console.log(request.params.Etiqueta);

        var contador;
        daoPreguntas.getPreguntasByEtiqueta(request.params.Etiqueta, function (error, resultado) {
            if (error) {
                response.status(500);
                console.log("ERROR EN LA BASE DE DATOS");
            } else {

                var pregunta = [];


                resultado.forEach((p) => {
                    daoEtiquetas.getEtiquetas(p.id_pregunta, function (err, resul) {

                        if (err) {
                            response.status(500);
                            console.log("ERROR EN LA BASE DE DATOS");
                        } else {

                            //console.log(p.id_pregunta);
                            var etiqueta = [];
                            for (var x of resul) {
                                etiqueta.push(x.etiqueta);
                            }

                            var fecha = new Date(p.fecha);
                            var fechaForm = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear();

                            var aux = {
                                id_pregunta: p.id_pregunta,
                                id_usuario: p.id_usuario,
                                titulo: p.titulo,
                                cuerpo: text_truncate(p.cuerpo, 150),
                                fecha: fechaForm,
                                nombre: p.nombre,
                                imagen: p.imagen,
                                etiqueta: etiqueta
                            }
                            pregunta.push(aux);

                            //console.log(pregunta);
                        }

                    })
                })

                daoPreguntas.countEtiquetas(request.params.Etiqueta, function (e, res) {
                    if (error) {
                        response.status(500);
                        console.log("ERROR EN LA BASE DE DATOS");
                    } else {
                        //console.log(res);
                        contador = res[0].TotalEtiquetas;
                        //response.status(200);
                        //console.log(pregunta);
                        response.render("filtrar_etiqueta", { perfil: usuario, etiqueta: etiqueta, contador: contador, pregunta: pregunta });
                        console.log("despues del render");
                    }
                })

            }
        })



    }

});

/*
****************************************************************************************************************************************************************
                FILTRAR POR TEXTO
****************************************************************************************************************************************************************                                                                   
*/

preguntas.post("/buscarTexto", function (request, response) {

    if (request.session.usuario == undefined) {
        response.redirect("/login/login.html");
        alert("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        var usuario = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        var texto = request.body.search;

        console.log("search=", texto);

        //----------- contador

        var contador;
        daoPreguntas.getPreguntasPorTexto(texto, function (error, resultado) {

            if (error) {
                response.status(500);
                console.log("ERROR EN LA BASE DE DATOS");
            } else {

                var pregunta = [];


                resultado.forEach((p) => {
                    daoEtiquetas.getEtiquetas(p.id_pregunta, function (err, resul) {

                        if (err) {
                            response.status(500);
                            console.log("ERROR EN LA BASE DE DATOS");
                        } else {

                            console.log(p.id_pregunta);
                            var etiqueta = [];
                            for (var x of resul) {
                                etiqueta.push(x.etiqueta);
                            }

                            var fecha = new Date(p.fecha);
                            var fechaForm = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear();

                            var aux = {
                                id_pregunta: p.id_pregunta,
                                id_usuario: p.id_usuario,
                                titulo: p.titulo,
                                cuerpo: text_truncate(p.cuerpo, 150),
                                fecha: fechaForm,
                                nombre: p.nombre,
                                imagen: p.imagen,
                                etiqueta: etiqueta
                            }
                            pregunta.push(aux);

                            //console.log(pregunta);
                        }

                    })
                })

                daoPreguntas.countTexto(texto, function (e, res) {
                    if (error) {
                        response.status(500);
                        console.log("ERROR EN LA BASE DE DATOS");
                    } else {

                        contador = res[0].TotalTexto;
                        //response.status(200);
                        console.log(pregunta);
                        response.render("filtrar_texto", { perfil: usuario, texto: texto, contador: contador, pregunta: pregunta });
                        console.log("despues del render");
                    }
                })

            }
        });

    }
});

module.exports = preguntas;