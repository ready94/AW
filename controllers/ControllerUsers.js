"use strict";

var config = require("../config");
var mysql = require("mysql");
const path = require("path");

var modelUsers = require("../models/ModelUsers");

var pool = mysql.createPool(config.mysqlConfig);

var daoUser = new modelUsers(pool);

/*
****************************************************************************************************************************************************************
                LOGGIN
****************************************************************************************************************************************************************                                                                   
*/

function acceso_login(request, response){
    response.render("login", { errorMsg: null }); 
}

function login(request, response, next){
    var email = request.body.mail;
    var password = request.body.pass;

    daoUser.isUserCorrect(email, password, cd_isUserCorrect);

    function cd_isUserCorrect(err, resultado, next) {
        if (err) 
            next(err);
        else if (resultado.length != undefined && password == resultado[0].password) {
            request.session.usuario = email;
            response.redirect("/usuarios/pag_principal.html");
        } 
        else 
            response.render("login", { errorMsg: " Dirección de correo y/o contraseña no válidos." });
    }
}

/*
****************************************************************************************************************************************************************
                LOGOUT USUARIO
****************************************************************************************************************************************************************                                                                   
*/

function logout(request,response){
    request.session.destroy();
    response.redirect("/usuarios/login.html");
}

/*
****************************************************************************************************************************************************************
                       CREAR CUENTA
****************************************************************************************************************************************************************                                                                   
*/

// Retorna un entero aleatorio entre min (incluido) y max (excluido)
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

    if (espacios) 
        return false;

    //que no haya ningun campo vacio
    if (p1.length == 0 || p2.length == 0)
        return false;

    //que la contraseña y la confirmacion sean iguales
    if (p1 != p2)
        return false;
    else 
        return true;
}

function acceso_crear_cuenta(request,response){
    response.render("crear_cuenta", { errorMsg: null }); 
}

function crear_cuenta(request,response,next){
    var email = request.body.mail;
    var password = request.body.pass;
    var password2 = request.body.pass_confirm;
    var nick = request.body.nick;
    var icon = "";

    if (request.file) 
        icon = request.file.filename;
    else
        icon = "icon" + getRandom(1, 10) + ".png";

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

            daoUser.insertUser(usuario, cd_insertUser);

            function cd_insertUser(err, resultado) {
                if (err) {
                    next(err); 
                } else if (resultado.length != 0) {
                    response.redirect("/usuarios/login.html"); 
                } else {
                    response.render("crear_cuenta",{ errorMsg: "Contraseña no válida/Las constraseñas deben coincidir." });
                }
            }
        } else{
            response.render("crear_cuenta",{ errorMsg: "Contraseña no válida/Las constraseñas deben coincidir." });        
        }

    } else{
        response.render("crear_cuenta",{ errorMsg: "Contraseña no válida/Las constraseñas deben coincidir." });        
    }
}

/*
****************************************************************************************************************************************************************
               PAGINA PRINCIPAL
****************************************************************************************************************************************************************                                                                   
*/

function pag_principal(request,response,next){
    if (request.session.usuario == undefined) {
        response.redirect("/usuarios/login.html");
    } else {

        response.locals.email = request.session.usuario;

        daoUser.getUser(response.locals.email, cb_getUser);

        function cb_getUser(error, resultado) {
            if (error) {
                next(error);
            } else {

                var usuario = { 
                    id: resultado[0].id_usuario,
                    nombre: resultado[0].nombre,
                    imagen: resultado[0].imagen
                };
                
                request.session.idUsuario = usuario.id;
                request.session.nombre = usuario.nombre;
                request.session.imagen = usuario.imagen;

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

function maxEtiquetas(etiquetas) {

    var cont = 1;
    var maximo = 1;
    var insert = false;
    let max = [];

    for (var i = 0; i < etiquetas.length - 1; i++) {
       
        if (etiquetas[i].etiqueta == etiquetas[i + 1].etiqueta) {
           
            if (etiquetas[i].id_usuario == etiquetas[i + 1].id_usuario) {
                cont += 1;
                
                if (cont > maximo) {
                    maximo = cont;
                    if (!insert) {
                        insert = true;
                        max.push(etiquetas[i]);
                    }
                }
            }
            else {
                maximo = 1;
                cont = 1;
                insert = false;
            }
        }
        else {
            cont = 1;
            insert = false;
        }
    }

    return max;
}

function usuarios(request,response,next){
    if (request.session.usuario == undefined) {
        response.redirect("/usuarios/login.html");
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

                let usuario = [];
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
                    else
                        response.render("usuarios", { perfil: perfil,usuario:usuario, etiqueta:maxEtiquetas(etiqueta) }); 
                });       
            }
        });
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

                let usuario = [];
                resultado.forEach((u) => {
                    
                    var aux = {
                        id_usuario: u.id_usuario,
                        nombre: u.nombre,
                        imagen: u.imagen,
                        reputacion: u.reputacion
                    }
                    usuario.push(aux);
                });

                daoUser.getAllEtiquetas(function(error,etiqueta){

                    if(error)
                        next(error);
                    else{
                        response.render("filtrar_nombre_usu", { perfil: perfil,usuario:usuario, etiqueta:maxEtiquetas(etiqueta),nombre:nombre }); 
                    }
                });
            }
        });
    }
}

/*
****************************************************************************************************************************************************************
                    PERFIL  USUARIOS
****************************************************************************************************************************************************************                                                                   
*/

function contadorTipo(medallas,categoria){
    var cont=0;
    medallas.forEach((m)=>{
        if(m.tipo==categoria)
            cont++;
    })

    return cont;
}

function hayMedalla(lista,merito){
    var ok=false;
    for(var i=0; i<lista.length; i++){
        if(lista[i].merito==merito){
            ok=true;
            var pos=i;
        }
    }

    return {ok,pos};
}

function medallero(medallas){

    var contBronce=contadorTipo(medallas,1);
    let bronce=[];
    var contPlata=contadorTipo(medallas,2);
    let plata=[];
    var contOro=contadorTipo(medallas,3);
    let oro=[];

    for(var i=0; i<medallas.length; i++){
       if(medallas[i].tipo==1){
        var b=hayMedalla(bronce,medallas[i].merito);
           if(b.ok){
                bronce[b.pos].cont+=1;
           }else{
                bronce.push({merito:medallas[i].merito,cont:1});
           }
       }
       else if(medallas[i].tipo==2){
        var p=hayMedalla(plata,medallas[i].merito);
           if(p.ok){
                plata[p.pos].cont+=1;
           }else{
                plata.push({merito:medallas[i].merito,cont:1});
           }
       }
       else{
        var o=hayMedalla(oro,medallas[i].merito);
           if(o.ok){
                oro[o.pos].cont+=1;
           }else{
                oro.push({merito:medallas[i].merito,cont:1});
           }
       }
    }

    return {contBronce,contPlata,contOro,bronce,plata,oro};
}

function perfil_usu(request,response,next){
    if (request.session.usuario == undefined) {
        response.redirect("/usuarios/login.html");
    } else {

        var usuario = {
            id: request.session.idUsuario,
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        var id_usuario = request.params.idUsuario
        daoUser.getUserByID(id_usuario, function cb_getPreguntas(err, resultado) {

            if (err) {
                next(err);
            } else {
                
                var fecha = new Date(resultado[0].fecha_alta);
                var fechaForm = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear();
                
                var bio = {
                    id_usuario: resultado[0].id_usuario,
                    nombre: resultado[0].nombre,
                    imagen: resultado[0].imagen,
                    fecha:fechaForm,
                    preguntas: resultado[0].num_preguntas,
                    respuestas: resultado[0].num_respuestas,
                    reputacion: resultado[0].reputacion
                }

                daoUser.getAllMedallas(bio.id_usuario,function(error,medallas){
                    if(error){
                        next(error);
                    }
                    else{
                        response.render("perfil_usu", { perfil: usuario, bio: bio,medallas: medallero(medallas) });
                    }
                })
            }
        })
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