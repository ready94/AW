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
const DAORelacion = require("./DAORelacion");

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
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        var pregunta = [];
        //var aux_etiquetas=[];

        daoPreguntas.getPreguntas(cb_getPreguntas);

        function cb_getPreguntas(error, resultado) {
            if (error) {
                response.status(500);
                console.log("ERROR EN LA BASE DE DATOS");
            } else {

                resultado.forEach(p => {

                    console.log("entra al for");

                    daoUser.getUserByID(p.id_usuario, cb_getUser);

                    console.log("Usuario: ", p.id_usuario);


                    function cb_getUser(err, res) {
                        console.log("entra en el function de getUser");
                        console.log("Pregunta:", p.id_pregunta);

                        if (err) {
                            response.status(500);
                            console.log("ERROR EN LA BASE DE DATOS");
                        } else {

                            console.log("entra en el else getUser");

                            var aux = {
                                idUsuario: p.id_usuario,
                                titulo: p.titulo,
                                cuerpo: p.cuerpo,
                                fecha: p.fecha,
                                nombre: res[0].nombre,
                                imagen: res[0].imagen,
                                etiqueta: ""
                            };
                            pregunta.push(aux);


                        }
                        for (var j = 0; j < 8; j++) {
                            console.log("pregunta2 " + j + ": ", pregunta[j]);
                        }
                        console.log("se ha terminado el else getEtiqetas");

                    }

                    

                    

                    console.log("termina el for");

                    

                })

               
                console.log("ME VOY A CAGAR EN TODO LO CAGABLE HOSTIA PUTA YA ", pregunta);
                /*resultado.forEach((p, i) => {

                    daoEtiquetas.getEtiquetas(p.id_pregunta, cb_getEtiqueta);
                    console.log("hace el daoEtiquetas");

                    function cb_getEtiqueta(error, resul) {
                        console.log("entra en el function de getEtiqueta");

                        if (error) {
                            response.status(500);
                            console.log("ERROR EN LA BASE DE DATOS");
                        } else {

                            console.log("con:", p.id_usuario, "y pregunta: ", p.id_pregunta);
                            console.log(i);
                            console.log(resul);

                            var aux_etiquetas = [];
                            for (var x of resul) {
                                aux_etiquetas.push(x.etiqueta);
                            }

                            if (aux_etiquetas != undefined && pregunta[i].etiqueta == undefined){
                                if (aux_etiquetas.length > 0) {
                                    pregunta[i].etiqueta = aux_etiquetas;
                                }
                            }
                            

                            console.log("devuelve: ", pregunta[i]);
                        }

                    }
                })*/




                //ESTO ES PA HACER EL COUNTER DE LAS PREGUNTAS
                daoPreguntas.count(cb_count);

                function cb_count(error, cont) {
                    if (error) {
                        response.status(500);
                        console.log("ERROR EN LA BASE DE DATOS");
                    } else {
                        var contador = cont[0].Total;
                        
                        console.log("FIN");



                        resultado.forEach((p, i) => {

                            daoEtiquetas.getEtiquetas(p.id_pregunta, cb_getEtiqueta);
                            console.log("hace el daoEtiquetas");

                            function cb_getEtiqueta(error, resul) {
                                console.log("entra en el function de getEtiqueta");

                                if (error) {
                                    response.status(500);
                                    console.log("ERROR EN LA BASE DE DATOS");
                                } else {

                                    console.log("con:", p.id_usuario, "y pregunta: ", p.id_pregunta);
                                    console.log(i);
                                    console.log(resul);

                                    var aux_etiquetas = [];
                                    for (var x of resul) {
                                        aux_etiquetas.push(x.etiqueta);
                                    }

                                    if (aux_etiquetas.length > 0) {
                                        pregunta[i].etiqueta = aux_etiquetas;
                                    }


                                    console.log("devuelve: ", pregunta[i]);
                                }

                            }
                        })

                        console.log("ME VOY A CAGAR EN TODO LO CAGABLE HOSTIA PUTA YA x 2", pregunta);
                        response.status(200);
                        response.render("preguntas", { preguntas: pregunta, perfil: usuario, contador: contador });
                    }

                }

            }


        }

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
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        response.status(200);
        response.render("formular_pregunta", { perfil: usuario });

    }

});

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
                console.log("ERROR BBDD" + err); //comen
            } else if (resultado.length != 0) {
                if (aux.length > 0) {

                    daoEtiquetas.getUltimoID(cb_getUltimoID);

                    function cb_getUltimoID(err, res) {
                        if (err) {
                            response.status(500);
                            console.log("ERROR BBDD" + err); //comen
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

                response.status(200);
                response.redirect("/preguntas.html");

            }
        }
    }
});

/*
****************************************************************************************************************************************************************
                FILTRAR POR ETIQUETA
****************************************************************************************************************************************************************                                                                   
*/

app.get("/filtrar_etiqueta.html", function (request, response) {

    if (request.session.usuario == undefined) {
        response.redirect("/login.html");
        alert("NO ESTAS LOGUEADO, INDIOTA");
    } else {

        var usuario = {
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        response.status(200);
        response.render("filtrar_etiqueta", { perfil: usuario }); 
            
    }
    
});

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
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

       
        daoUser.getUserByID(request.params.idUsuario,cb_getPreguntas);

        function cb_getPreguntas(err, resultado){

            if(err){
                response.status(500);
                console.log("ERROR EN LA BASE DE DATOS");
            }else{

                
                var aux={
                    nombre: resultado[0].nombre,
                    imagen: resultado[0].imagen,
                    fecha: resultado[0].fecha_alta.toDateString(),
                    preguntas: resultado[0].num_preguntas,
                    respuestas: resultado[0].num_respuestas,
                    reputacion: resultado[0].reputacion,
                    medallas: resultado[0].medallas
                }

                response.status(200);
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
            nombre: request.session.nombre,
            imagen: request.session.imagen
        };

        console.log("heeeey",request.params.idPregunta);
        daoPreguntas.getByIdPregunta(request.params.idPregunta, cb_getByIdPreguntas);

        var aux1=[];
        var aux2=[];
        var etiquetas=[];

        function cb_getByIdPreguntas(err, resultado){

            if(err){
                response.status(500);
                console.log("ERROR EN LA BASE DE DATOS");
            }else{

               // console.log("heeeey",resultado);
                var aux = {
                    idUsuario: resultado[0].id_usuario,
                    titulo:resultado[0].titulo,
                    cuerpo: resultado[0].cuerpo,
                    fecha: resultado[0].fecha_alta
                };
                aux1.push(aux);

                console.log(aux1[0].idUsuario);
                daoUser.getUserByID(aux1[0].idUsuario,cb_getIdUser);

        
                function cb_getIdUser(err,resul){

                if(err){
                    response.status(500);
                    console.log("ERROR EN LA BASE DE DATOS");
                }else{

                    console.log("hola", resul);
                    aux2= {
                        nombre: resul[0].nombre,
                        imagen: resul[0].imagen
                    };

                }
            }

            console.log("heeeey",request.params.idPregunta);
            daoEtiquetas.getEtiquetas(request.params.idPregunta, cb_getEtiqueta);
        
            function cb_getEtiqueta(err, res){

                if(err){
                    response.status(500);
                    console.log("ERROR EN LA BASE DE DATOS");
                }else{

                    for(var x of res){
                        etiquetas.push(x.etiqueta);
                    }
               
                }
            }
               
            }
        }

        response.status(200);
        response.render("informacion_pregunta", { perfil: usuario , pregunta: aux1, usu:aux2, etiquetas:etiquetas}); 
        

       
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