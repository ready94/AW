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

var modelUsers = require("../models/ModelUsers");
//const ControllerUsuario = require("../controllers/ControllerUsers.js");


//const { nextTick } = require("process");
var pool = mysql.createPool(config.mysqlConfig);

var daoUser = new modelUsers(pool);


/*
****************************************************************************************************************************************************************
                TIENE QUE ESTAR LOGGEADO
****************************************************************************************************************************************************************                                                                   
*/

function comprobarLogin(request, response, next) {
    console.log("ha entrado")
    console.log(request.session.usuario);
    if (request.session.usuario) {
        console.log("no hay usu");
        next();
    } else {
        console.log("hay usu");
        response.redirect("/usuarios/login.html");
    }
}

/*
****************************************************************************************************************************************************************
                LOGGIN
****************************************************************************************************************************************************************                                                                   
*/

function acceso_login(request,response){
    response.render("login", { errorMsg: null }); // renderiza la pagina login.ejs
}

function login(request,response,next){
    var email = request.body.mail;
    var password = request.body.pass;

    daoUser.isUserCorrect(email, password, cd_isUserCorrect) // comprobacion si el user esta en la base de datos

    function cd_isUserCorrect(err, resultado, next) {
        if (err) {
            /*response.status(500);
            console.log("ERROR CON LA BASE DE DATOS " + err);
            response.render("login", { errorMsg: null })*/
            next(err);
        } else if (resultado.length != 0) {
            console.log("USUARIO LOGUEADO CORRECTAMENTE");
            request.session.usuario = email; // usuario logueado actualmente
            response.redirect("/usuarios/pag_principal.html"); // redirecion a la pagina perfil que se muestra por pantalla

        } else {
            console.log("ERROR AL LOGUEAR USUARIO ");
            response.render("login", { errorMsg: " Dirección de correo y/o contraseña no válidos." }) //renderiza la pagina perfil.ejs
        }
    }
}

/*
****************************************************************************************************************************************************************
                LOGOUT USUARIO
****************************************************************************************************************************************************************                                                                   
*/

function logout(request,response){
    request.session.destroy();
    //console.log("Usuario deslogueado correctamente")
    response.redirect("/usuarios/login.html");
}

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
        console.log("La contraseña no puede contener espacios en blanco");
        return false;
    }

    //que no haya ningun campo vacio
    if (p1.length == 0 || p2.length == 0) {
        console.log("Los campos de la password no pueden quedar vacios");
        return false;
    }

    //que la contraseña y la confirmacion sean iguales
    if (p1 != p2) {
        console.log("Las passwords deben de coincidir");
        return false;
    } else {
        return true;
    }

}

function acceso_crear_cuenta(request,response){
    response.render("crear_cuenta", { errorMsg: null }); 
}

function crear_cuenta(request,response,next){
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
        //Tiene que contener al menos un dígito, una mayúscula y una minúscula
        var passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

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
                    next(err);
                    /*response.status(500);
                    console.log("ERROR BBDD" + err); //comen
                    if (err.sqlState == 2300) {
                        console.log("Email ya existente");
                    };
                    response.render("crear_cuenta", { errorMsg: null })*/
                } else if (resultado.length != 0) {
                   // console.log("USUARIO CREADO CORRECTAMENTE"); //comen
                    response.redirect("/usuarios/login.html"); // redirecion a la pagina login si no ha habido errores 
                } else {
                    //console.log("ERROR AL CREAR EL USUARIO "); //comen
                    response.redirect("/usuarios/crear_cuenta.html");
                }
            }
        } else {
            console.log("contraseña no valida"); //comen
        }
    }
}

/*
****************************************************************************************************************************************************************
               PAGINA PRINCIPAL
****************************************************************************************************************************************************************                                                                   
*/

function pag_principal(request,response,next){
    //console.log("pagina principal");
    if (request.session.usuario == undefined) {
        response.redirect("/usuarios/login.html");
        console.log("NO ESTAS LOGUEADO, INDIOTA");
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

                //response.status(200);
                response.render("pag_principal", { perfil: usuario });
            }
        }
    }
}

/*
****************************************************************************************************************************************************************
                            USUARIOS
****************************************************************************************************************************************************************                                                                   
*/

function maxEtiquetas(etiquetas){
    
    var cont=1;
    var maximo=1;
    let max=[];
    //console.log("comienza:",etiquetas);

    for(var i=0; i<etiquetas.length-1;i++){
        //console.log("i",i, ": ",etiquetas[i].etiqueta);
        //console.log("i++",i+1, ": ",etiquetas[i+1].etiqueta);
        if(etiquetas[i].etiqueta==etiquetas[i+1].etiqueta){
            cont++;
            if(etiquetas[i].id_usuario==etiquetas[i+1].id_usuario && cont>maximo){
                max.push(etiquetas[i]);
                maximo=cont;
            }
            else{
                maximo=1;
                cont=1;
            }
        }
        else{
            maximo=1;
            cont=1;
        }
    }

    //console.log("termina",max);
    return max;
}

function usuarios(request,response,next){
    if (request.session.usuario == undefined) {
        response.redirect("/usuarios/login.html");
        console.log("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        var perfil = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        daoUser.getAllUser(function(error,resultado){
            if (error) {
                next(error);
            } else {

                let usuario=[];
               //console.log(resultado);
                resultado.forEach((u) => {
                    
                    var aux = {
                        id_usuario: u.id_usuario,
                        nombre: u.nombre,
                        imagen: u.imagen,
                        reputacion: u.reputacion
                    }
                    usuario.push(aux);
                })

                daoUser.getAllEtiquetas(function(error,etiqueta){

                    if(error)
                        next(error);
                    else{
                        response.render("usuarios", { perfil: perfil,usuario:usuario, etiqueta:maxEtiquetas(etiqueta) }); 
                    }

                })       

                
            }
        })
    }

}

/*
****************************************************************************************************************************************************************
                FILTRAR POR USUARIO
****************************************************************************************************************************************************************                                                                   
*/

function filtrar_usuario(request,response,next){
    if (request.session.usuario == undefined) {
        response.redirect("/usuarios/login.html");
        console.log("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        var perfil = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        var nombre = request.body.searchUsu;

        daoUser.getUsuariosPorNombre(nombre, function (error, resultado) {

            if (error) {
                next(error);
            } else {

                //console.log("users con",nombre,":",resultado);
                let usuario=[];
               //console.log(resultado);
                resultado.forEach((u) => {
                    
                    var aux = {
                        id_usuario: u.id_usuario,
                        nombre: u.nombre,
                        imagen: u.imagen,
                        reputacion: u.reputacion
                    }
                    usuario.push(aux);
                })

                daoUser.getAllEtiquetas(function(error,etiqueta){

                    if(error)
                        next(error);
                    else{
                        response.render("filtrar_nombre_usu", { perfil: perfil,usuario:usuario, etiqueta:maxEtiquetas(etiqueta),nombre:nombre }); 
                    }

                })       
   
            }
        });
    }
}

/*
****************************************************************************************************************************************************************
                    PERFIL  USUARIOS
****************************************************************************************************************************************************************                                                                   
*/

function perfil_usu(request,response,next){
    if (request.session.usuario == undefined) {
        response.redirect("/usuarios/login.html");
        console.log("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        var usuario = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

       // console.log("id:", request.params.idUsuario);
        daoUser.getUserByID(request.params.idUsuario, cb_getPreguntas);

        function cb_getPreguntas(err, resultado) {

            if (err) {
                next(err);
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
}


module.exports={
    perfil_usu: perfil_usu,
    filtrar_usuario:filtrar_usuario,
    usuarios: usuarios,
    pag_principal:pag_principal,
    crear_cuenta: crear_cuenta,
    acceso_crear_cuenta: acceso_crear_cuenta,
    logout: logout,
    login: login,
    acceso_login:acceso_login
};