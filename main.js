"use strict";
const config = require("./config");
const mysql = require("mysql");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const expressValidator = require("express-validator");
const alert = require("alert");
const MySQLStore = mysqlSession(session);
const sessionStore = new MySQLStore(config.mysqlConfig);

const DAOUsers = require("./DAOUsers");
const DAOPreguntas = require("./DAOPreguntas");
const DAOEtiquetas = require("./DAOEtiquetas");
const DAORespuestas = require("./DAORespuestas");

// Creación de la sesion
const middlewareSession = session({
    saveUninitialized: false,
    secret: "foobar34",
    resave: false,
    store: sessionStore
});

// Crear un servidor Express.js
const app = express();

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);

const ficherosEstaticos = path.join(__dirname, "public");

let daoUser = new DAOUsers(pool);
let daoPreguntas = new DAOPreguntas(pool);
let daoEtiquetas = new DAOEtiquetas(pool);
let daoRespuestas= new DAORespuestas(pool);
let moment = require("moment");

app.use(express.static(ficherosEstaticos));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(middlewareSession);
app.use(expressValidator());

/*
****************************************************************************************************************************************************************
                ARRANCAR EL SERVIDOR EN EL PUERTO 3000
****************************************************************************************************************************************************************                                                                   
*/
app.listen(config.port, function (err) {
    if (err)
        console.log("ERROR al iniciar el servidor");
    else 
        console.log(`Servidor arrancado en el puerto ${config.port}`);
});

app.get("/login.html", function(request, response) {

    response.status(200);
    response.render("login", { errorMsg: null }); // renderiza la pagina login.ejs

});

app.post("/login", function(request, response) { // peticion a la view login.ejs

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

app.get("/logout", function(request, response) { // desconecta el usuario logueado actualmente
    request.session.destroy();
    console.log("Usuario deslogueado correctamente")
    response.redirect("/login.html");
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

app.get("/crear_cuenta.html", function(request, response) {

    response.status(200);
    response.render("crear_cuenta", { errorMsg: null }); // renderiza la pagina login.ejs

});

app.post("/crearCuenta", function(request, response) { // peticion a la view login.ejs

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
                    response.redirect("/login.html"); // redirecion a la pagina login si no ha habido errores 
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
               PAGINA PRINCIPAL
****************************************************************************************************************************************************************                                                                   
*/
app.get("/pag_principal.html", function(request, response) {
    if (request.session.usuario == undefined) {
        response.redirect("/login.html");
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
                    PREGUNTAS
****************************************************************************************************************************************************************                                                                   
*/
app.get("/preguntas.html", function (request, response) {
    if (request.session.usuario == undefined) {
        response.redirect("/login.html");
        alert("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        var usuario = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        //----------- contador
        var contador;
        daoPreguntas.getPreguntas(function(error,resultado){

            if(error){
                response.status(500);
                console.log("ERROR EN LA BASE DE DATOS");
            }else{
                
                var pregunta=[];

                resultado.forEach((p)=>{
                    daoEtiquetas.getEtiquetas(p.id_pregunta,function(err,resul){
                        
                        if(err){
                            response.status(500);
                            console.log("ERROR EN LA BASE DE DATOS");
                        }else{

                            console.log(p.id_pregunta);
                            var etiqueta=[];
                            for(var x of resul){
                                etiqueta.push(x.etiqueta);
                            }

                            var aux={
                                id_pregunta: p.id_pregunta,
                                id_usuario: p.id_usuario,
                                titulo: p.titulo,
                                cuerpo: p.cuerpo,
                                fecha: p.fecha,
                                nombre: p.nombre,
                                imagen: p.imagen,
                                etiqueta:etiqueta
                            }
                            pregunta.push(aux);

                            //console.log(pregunta);
                        }
                        
                    })
                })
                
                daoPreguntas.count(function(e,res){
                    if (error) {
                        response.status(500);
                        console.log("ERROR EN LA BASE DE DATOS");
                    } else {
                        
                        contador=res[0].Total;
                        //response.status(200);
                        response.render("preguntas", { perfil: usuario,contador:contador,pregunta:pregunta }); 
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
app.get("/formular_pregunta.html", function (request, response) {

    if (request.session.usuario == undefined) {
        response.redirect("/login.html");
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

app.post("/crearPregunta", function (request, response) {

    if (request.session.usuario == undefined) {
        response.redirect("/login.html");
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

app.get("/sin_responder.html", function (request, response) {

    if (request.session.usuario == undefined) {
        response.redirect("/login.html");
        alert("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        var usuario = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        var contador;
        daoPreguntas.getPreguntasSinResponder(function(error,resultado){

            if(error){
                response.status(500);
                console.log("ERROR EN LA BASE DE DATOS");
            }else{
                
                var pregunta=[];

                resultado.forEach((p)=>{
                    daoEtiquetas.getEtiquetas(p.id_pregunta,function(err,resul){
                        
                        if(err){
                            response.status(500);
                            console.log("ERROR EN LA BASE DE DATOS");
                        }else{

                            //console.log(p.id_pregunta);
                            var etiqueta=[];
                            for(var x of resul){
                                etiqueta.push(x.etiqueta);
                            }

                            var aux={
                                id_pregunta: p.id_pregunta,
                                id_usuario: p.id_usuario,
                                titulo: p.titulo,
                                cuerpo: p.cuerpo,
                                fecha: p.fecha,
                                nombre: p.nombre,
                                imagen: p.imagen,
                                etiqueta:etiqueta
                            }
                            pregunta.push(aux);

                            //console.log(pregunta);
                        }
                        
                    })
                })
                
                daoPreguntas.countSinResponder(function(e,res){
                    if (error) {
                        response.status(500);
                        console.log("ERROR EN LA BASE DE DATOS");
                    } else {
                        
                        contador=res[0].TotalSinResponder;
                        //response.status(200);
                        console.log(pregunta);
                        response.render("sin_responder", {  perfil: usuario,contador:contador,pregunta:pregunta }); 
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

app.get("/filtrar_etiqueta/:Etiqueta", function (request, response) {

    if (request.session.usuario == undefined) {
        response.redirect("/login.html");
        alert("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        var usuario = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        var etiqueta= request.params.Etiqueta;
        console.log(request.params.Etiqueta);

        var contador;
        daoPreguntas.getPreguntasByEtiqueta(request.params.Etiqueta,function(error,resultado){
            if(error){
                response.status(500);
                console.log("ERROR EN LA BASE DE DATOS");
            }else{
                
                var pregunta=[];
                

                resultado.forEach((p)=>{
                    daoEtiquetas.getEtiquetas(p.id_pregunta,function(err,resul){
                        
                        if(err){
                            response.status(500);
                            console.log("ERROR EN LA BASE DE DATOS");
                        }else{

                            //console.log(p.id_pregunta);
                            var etiqueta=[];
                            for(var x of resul){
                                etiqueta.push(x.etiqueta);
                            }

                            var aux={
                                id_pregunta: p.id_pregunta,
                                id_usuario: p.id_usuario,
                                titulo: p.titulo,
                                cuerpo: p.cuerpo,
                                fecha: p.fecha,
                                nombre: p.nombre,
                                imagen: p.imagen,
                                etiqueta:etiqueta
                            }
                            pregunta.push(aux);

                            //console.log(pregunta);
                        }
                        
                    })
                })
                
                daoPreguntas.countEtiquetas(request.params.Etiqueta,function(e,res){
                    if (error) {
                        response.status(500);
                        console.log("ERROR EN LA BASE DE DATOS");
                    } else {
                        //console.log(res);
                        contador=res[0].TotalEtiquetas;
                        //response.status(200);
                        //console.log(pregunta);
                        response.render("filtrar_etiqueta", { perfil: usuario,etiqueta:etiqueta,contador:contador,pregunta:pregunta }); 
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

app.post("/buscarTexto", function (request, response) {

    if (request.session.usuario == undefined) {
        response.redirect("/login.html");
        alert("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        var usuario = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        var texto = request.body.search;

        console.log("search=",texto);

        //----------- contador

        var contador;
        daoPreguntas.getPreguntasPorTexto(texto,function(error,resultado){

            if(error){
                response.status(500);
                console.log("ERROR EN LA BASE DE DATOS");
            }else{
                
                var pregunta=[];
                

                resultado.forEach((p)=>{
                    daoEtiquetas.getEtiquetas(p.id_pregunta,function(err,resul){
                        
                        if(err){
                            response.status(500);
                            console.log("ERROR EN LA BASE DE DATOS");
                        }else{

                            console.log(p.id_pregunta);
                            var etiqueta=[];
                            for(var x of resul){
                                etiqueta.push(x.etiqueta);
                            }

                            var aux={
                                id_pregunta: p.id_pregunta,
                                id_usuario: p.id_usuario,
                                titulo: p.titulo,
                                cuerpo: p.cuerpo,
                                fecha: p.fecha,
                                nombre: p.nombre,
                                imagen: p.imagen,
                                etiqueta:etiqueta
                            }
                            pregunta.push(aux);

                            //console.log(pregunta);
                        }
                        
                    })
                })
                
                daoPreguntas.countTexto(texto,function(e,res){
                    if (error) {
                        response.status(500);
                        console.log("ERROR EN LA BASE DE DATOS");
                    } else {
                        
                        contador=res[0].TotalTexto;
                        //response.status(200);
                        console.log(pregunta);
                        response.render("filtrar_texto", { perfil: usuario,texto:texto,contador:contador,pregunta:pregunta }); 
                        console.log("despues del render");
                    }
                })

            }
        });

    }
});

/*
app.post("/buscarTexto", function (request, response) {

    if (request.session.usuario == undefined) {
        response.redirect("/login.html");
        alert("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        var usuario = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        var texto = request.body.search;

        console.log("search=",texto);

        //----------- contador

        var contador;
        daoPreguntas.countTexto(texto,cb_countTexto);

        function cb_countTexto(error,resultado){
            if(error){
                response.status(500);
                console.log("ERROR EN LA BASE DE DATOS");
            }else{
                console.log("entra en el contador");
                contador=resultado[0].TotalTexto;
            }
        }

        console.log("sale del contador");

        //------------ obtencion de pregunta
        daoPreguntas.getPreguntasPorTexto(texto, cb_getPreguntasPorTexto);

        function cb_getPreguntasPorTexto(error,resultado){
            if(error){
                response.status(500);
                console.log("ERROR EN LA BASE DE DATOS");
            }else{

                var pregunta=[];

                console.log("entra al get preguntas");
                //console.log("preguntas poor texto",resultado)
                //console.log("Usuario:",resultado[0].id_usuario)

                resultado.forEach((p)=>{
                    console.log("Usuario:",p.id_usuario)
                    daoUser.getUserByID(p.id_usuario,cb_getUserByID);

                function cb_getUserByID(err,resul){
                    if(err){
                        response.status(500);
                        console.log("ERROR EN LA BASE DE DATOS");
                    }else{
                        console.log("user", resul);
                        console.log("añadir etiquetas");

                        daoEtiquetas.getEtiquetas(p.id_pregunta,cb_getEtiquetas);

                        function cb_getEtiquetas(e,res){
                            if(e){
                                response.status(500);
                                console.log("ERROR EN LA BASE DE DATOS");
                            }else{

                                console.log("entra en el get etiquetas");
                                console.log("etiqueta",res);
                                console.log(res[0].etiqueta);

                                var etiqueta=[];

                                for(var i of res){
                                    etiqueta.push(i.etiqueta);
                                }

                                var aux={
                                    idPregunta: p.id_pregunta,
                                    idUsuario: p.id_usuario,
                                    titulo: p.titulo,
                                    cuerpo: p.cuerpo,
                                    fecha: p.fecha,
                                    nombre: resul[0].nombre,
                                    imagen: resul[0].imagen,
                                    etiqueta:etiqueta
                                }
                                pregunta.push(aux);

                                console.log("RESULTADO TOTAL:",pregunta);

                               
                            }
                        }

                   
                       
                    }
                }
                })


                console.log("fin");
                console.log("holi",pregunta);
                response.status(200);
                response.render("./filtrar_texto", { perfil: usuario,texto:texto,contador:contador,preguntas:pregunta }); 
                console.log("despues del render");
            }
        }
     
    }
    
});
*/

/*
****************************************************************************************************************************************************************
                            USUARIOS
****************************************************************************************************************************************************************                                                                   
*/

app.get("/usuarios.html", function (request, response) {

    if (request.session.usuario == undefined) {
        response.redirect("/login.html");
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

app.get("/perfil_usu/:idUsuario", function (request, response) {

    if (request.session.usuario == undefined) {
        response.redirect("/login.html");
        alert("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        var usuario = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        console.log("id:", request.params.idUsuario);
        daoUser.getUserByID(request.params.idUsuario,cb_getPreguntas);

        function cb_getPreguntas(err, resultado){

            if(err){
                response.status(500);
                console.log("ERROR EN LA BASE DE DATOS");
            }else{

                
                var aux={
                    nombre: resultado[0].nombre,
                    imagen: resultado[0].imagen,
                    fecha: resultado[0].fecha_alta,
                    preguntas: resultado[0].num_preguntas,
                    respuestas: resultado[0].num_respuestas,
                    reputacion: resultado[0].reputacion,
                    medallas: resultado[0].medallas
                }

                
                response.render("perfil_usu", { perfil: usuario , bio: aux}); 
                
            }
        }

       
    }
    
});

/*
****************************************************************************************************************************************************************
                    INFOR PREGUNTA
****************************************************************************************************************************************************************                                                                   
*/

app.get("/informacion_pregunta/:idPregunta", function (request, response) {

    if (request.session.usuario == undefined) {
        response.redirect("/login.html");
        alert("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        var usuario = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        console.log(request.params.idPregunta);
        daoPreguntas.getPreguntaInformacion(request.params.idPregunta,function(error,resultado){

            if(error){
                response.status(500);
                console.log("ERROR EN LA BASE DE DATOS");
            }else{

                daoEtiquetas.getEtiquetas(request.params.idPregunta,function(error,res){
                    if(error){
                        response.status(500);
                        console.log("ERROR EN LA BASE DE DATOS");
                    }else{

                        var etiqueta=[];

                        for(var i of res){
                            etiqueta.push(i.etiqueta);
                        }

                        console.log(resultado);
                        var pregunta={
                            id_pregunta:resultado[0].id_pregunta,
                            id_usuario: resultado[0].id_usuario,
                            titulo: resultado[0].titulo,
                            cuerpo: resultado[0].cuerpo,
                            fecha: resultado[0].fecha,
                            nombre: resultado[0].nombre,
                            imagen: resultado[0].imagen,
                            etiqueta: etiqueta
                        }


                        daoRespuestas.getRespuestaByPregunta(pregunta.id_pregunta,function(err,resul){

                            if(error){
                                response.status(500);
                                console.log("ERROR EN LA BASE DE DATOS");
                            }else{

                                var respuesta=[];
                                resul.forEach((r)=>{

                                    var aux={
                                        texto:r.texto,
                                        fecha_respuesta:r.fecha_respuesta,
                                        nombre:r.nombre,
                                        imagen:r.imagen
                                    }
                                    respuesta.push(aux);
                                })

                                console.log(respuesta);
                                response.render("informacion_pregunta", { pregunta: pregunta, perfil: usuario,respuesta:respuesta });
                           
                            }

                        })
                  }
                });
            }
            
        });


/*
****************************************************************************************************************************************************************
                RESPONDER PREGUNTA
****************************************************************************************************************************************************************                                                                   
*/

app.post("/responderPregunta", function (request, response) {

    if (request.session.usuario == undefined) {
        response.redirect("/login.html");
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
        function cb_getByIdPreguntas(error,resultado){

            if(error){
                response.status(500);
                console.log("ERROR EN LA BASE DE DATOS");
            }else{
                
                daoUser.getUserByID(resultado[0].id_usuario,cb_getUserByID);

                function cb_getUserByID(err,resul){
                    if(err){
                        response.status(500);
                        console.log("ERROR EN LA BASE DE DATOS");
                    }else{

                        daoEtiquetas.getEtiquetas(request.params.idPregunta,cb_getEtiquetas);

                        function cb_getEtiquetas(e,res){
                            if(e){
                                response.status(500);
                                console.log("ERROR EN LA BASE DE DATOS");
                            }else{

                                var etiqueta=[];

                                for(var i of res){
                                    etiqueta.push(i.etiqueta);
                                }

                                var pregunta={
                                    idUsuario: resultado[0].id_usuario,
                                    titulo: resultado[0].titulo,
                                    cuerpo: resultado[0].cuerpo,
                                    fecha: resultado[0].fecha.toDateString(),
                                    nombre: resul[0].nombre,
                                    imagen: resul[0].imagen,
                                    etiqueta: etiqueta
                                }

                                console.log(pregunta);
                                //response.status(200);
                                response.render("informacion_pregunta", { pregunta: pregunta, perfil: usuario });

                            }
                        }
                    }
                }
            }
        }*/

       
    }
    
});




/* No sabemos como funciona esto hulio
app.get("/reset", function(request, response) {
    response.status(200);
    request.session.contador = 0;
    response.type("text/plain");
    response.end("Has reiniciado el contador");
});
*/




// Definición de las funciones callback