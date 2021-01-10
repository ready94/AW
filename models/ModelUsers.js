"use strict";

class DAOUsers {

    constructor(pool) {
            this.pool = pool;
        }
        //Comprobar si el usuario es correcto
    isUserCorrect(email, password, callback) {

        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos correct"));
            } else {
                connection.query("SELECT * FROM usuario WHERE email = ? AND password = ?", [email, password],
                    function(err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"));
                        } else {
                            if (rows.length === 0) {
                                callback(null, false); //no está el usuario con el password proporcionado
                            } else {
                                callback(null, true);
                            }
                        }
                    });
            }
        });
    }

    // obtener el nombre del fichero que contiene la imagen de perfil de un usuario
    getUserImageName(email, callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos image"));
            } else {
                connection.query("SELECT imagen FROM usuario WHERE email = '" + email + "';",
                    function(err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"));
                        } else {
                            if (rows.length === 0) {
                                callback(null, false); //no está el usuario con el password proporcionado
                            } else {
                                callback(null, true);
                            }
                        }
                    });
            }
        });
    }

    getUser(email, callback) {
        this.pool.getConnection(function(err, conexion) {
            if (err) {
                callback(err);
            } else {
                // devuelve el usuario entero cuyo email es el pasado por parametro
                var sql = 'SELECT * FROM usuario WHERE email = ?;'
                var para = [email]
                conexion.query(sql, para, function(err, resultado) {
                    conexion.release();
                    if (err) {
                        callback(err);
                    } else {
                        /*console.log(resultado);*/
                        callback(null, resultado);

                    }
                }); //END QUERY
                
            }
        }); //END GET CONEXION
    }

    getUserByID(idUsuario, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                callback(err);
            } else {
                // devuelve el usuario entero cuyo email es el pasado por parametro
                var sql = 'SELECT * FROM usuario WHERE id_usuario = ?;';
                var para = [idUsuario];
                conexion.query(sql, para, function (err, resultado) {
                    conexion.release();
                    if (err) {
                        callback(err);
                    } else {
                        console.log(resultado);
                        callback(null, resultado);

                    }
                }); //END QUERY
                
            }
        }); //END GET CONEXION
    }


    insertUser(user, callback) {

        this.pool.getConnection(function(err, conexion) {

            if (err) {
                callback(err);
            } else {
                // inserta un nuevo usuario en la base de datos con los datos del objeto "user"       
                var sql = 'INSERT INTO usuario (nombre, email, password, imagen, fecha_alta, num_preguntas, num_respuestas, reputacion, medallas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);';
                var para = [user.nombre, user.email, user.password, user.imagen, user.fecha_alta, 0, 0, 0, 0];

                conexion.query(sql, para, function(err, resultado) {
                    conexion.release();
                    if (err) {
                        callback(err);
                    } else {
                        console.log(resultado)
                        callback(null, resultado);
                    }
                }); //END QUERY                
                
            }
        }); //END GET CONEXION

    } //END METODO

    getReputacion(id, callback) {
        this.pool.getConnection(function (err, conexion) {

            if (err) {
                callback(err);
            } else {
                // devuelve el usuario entero cuyo email es el pasado por parametro
                var sql = "SELECT reputacion FROM usuario WHERE id_usuario = ?;";
                var para = [id];
                conexion.query(sql, para, function (err, resultado) {
                    conexion.release();
                    if (err) {
                        callback(err);
                    } else {
                        console.log(resultado);
                        callback(null, resultado);

                    }
                }); //END QUERY

            }
        }); //END GET CONEXION
    }

    actualizarReputacion(id, reputacion, callback) {
        console.log("id de usuario: " + id);
        console.log("reputacion: " + reputacion);
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
                var sql = "UPDATE usuario SET reputacion=" + reputacion + " WHERE id_usuario=" + id + ";";

                conexion.query(sql, function (err, resultado) {
                    conexion.release();
                    if (err)
                        callback(err);
                    else {
                        callback(null, resultado);
                    }

                });//END QUERY                

            }
        });//END GET CONEXION
    }

    /*
    ****************************************************************************************************************************************************************
                ETIQUETAS
    ****************************************************************************************************************************************************************                                                                   
    */

    getEtiquetaUser(idUser,callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
            
                const sql= "SELECT etiqueta FROM etiquetas WHERE id_usuario=" + idUser + " ORDER BY etiqueta;";
                conexion.query(sql, function (err, resultado) {
                    conexion.release();
                    if (err)
                        callback(err);
                    else {

                        console.log("etiquetas:",resultado);
                        var etiqueta=[];
                        resultado.forEach((e)=>{
                        etiqueta.push(e);
                        })
    
                        var max=0;
                        var cont=0;
                        var aux=etiqueta[0];
                        console.log(aux);
                        for(var i=1; i< etiqueta.length;i++){
                            if(etiqueta[i]==etiqueta[i--]){
                                cont++;
                                if(cont>max){
                                    max=cont;  
                                    aux=etiqueta[i];
                                }
                            
                            }
                            else{
                                cont=1;
                            }
                        }
    
                        console.log("etiqueta",aux);
                        callback(null,aux);
                    }
            
                });//END QUERY                
           
            }
        });//END GET CONEXION
    }
}

module.exports = DAOUsers;