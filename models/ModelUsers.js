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
                const sql="SELECT * FROM usuario WHERE email = ? AND password = ?"
                connection.query(sql, [email, password],function(err, rows) {
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
                const sql="SELECT imagen FROM usuario WHERE email = ?;"
                connection.query(sql,[email],function(err, rows) {
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
                const sql = "SELECT * FROM usuario WHERE email = ?;";
                conexion.query(sql, [email], function(err, resultado) {
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

    getAllUser(callback){
        this.pool.getConnection(function(err, conexion) {
            if (err) {
                callback(err);
            } else {
                // devuelve el usuario entero cuyo email es el pasado por parametro
                const sql = "SELECT id_usuario,nombre,imagen,reputacion FROM usuario;"
                
                conexion.query(sql, function(err, resultado) {
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

    getUsuariosPorNombre(nombre, callback){
        
        this.pool.getConnection(function (err, conexion) {
            
            if (err)
                callback(err);
            else {
            //contador de preguntas
            let like= "%"+nombre+"%";
            const sql = "SELECT id_usuario,nombre,imagen,reputacion FROM usuario WHERE nombre LIKE ? ;";
            
                conexion.query(sql,[like], function (err, resultado) {
                    conexion.release();
                    if (err)
                        callback(err);
                    else{
                        console.log(resultado);
                        callback(null, resultado);

                    }
                        
                });//END QUERY                
                
            }
        });//END GET CONEXION

    }
   

    getUserByID(idUsuario, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                callback(err);
            } else {
                
                const sql = "SELECT * FROM usuario WHERE id_usuario = ?;";
                conexion.query(sql,[idUsuario], function (err, resultado) {
                    conexion.release();
                    if (err) {
                        callback(err);
                    } else {
                        //console.log(resultado);
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
                const sql = "INSERT INTO usuario (nombre, email, password, imagen, fecha_alta, num_preguntas, num_respuestas, reputacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?);";
                var para = [user.nombre, user.email, user.password, user.imagen, user.fecha_alta, 0, 0, 1];

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
                const sql = "SELECT reputacion FROM usuario WHERE id_usuario = ?;";
                
                conexion.query(sql,[id], function (err, resultado) {
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
                const sql = "UPDATE usuario SET reputacion= ? WHERE id_usuario= ?;";

                conexion.query(sql,[reputacion,id], function (err, resultado) {
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

    getAllEtiquetas(callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
        
                const sql = "SELECT etiqueta, id_usuario FROM etiquetas ORDER BY etiqueta";   
            
                conexion.query(sql, function (err, resultado) {
                    conexion.release();
                    if (err)
                        callback(err);
                    else{
                        let etiqueta=[];

                        resultado.forEach(element => etiqueta.push({
                            id_usuario: element.id_usuario,
                            etiqueta: element.etiqueta
                        }));

                        callback(null, etiqueta);
                    }
                    
                });//END QUERY                
            
            }
        });//END GET CONEXION
    }



    /*
    ****************************************************************************************************************************************************************
                MEDALLAS
    ****************************************************************************************************************************************************************                                                                   
    */

    getAllMedallas(id_usuario,callback){
        this.pool.getConnection(function (error, conexion) {

            if (error){ 
                callback(error);
            }   
            else {
            
                const sql="SELECT merito,tipo FROM medallas_preguntas WHERE id_usuario= ?;";
                conexion.query(sql,[id_usuario], function (err, resultado) {
                    
                    if (err)
                        callback(err);
                    
                    else{
                        if (error) 
                            callback(error);  
                        else {
                        
                            const sql2="SELECT merito,tipo FROM medallas_respuestas WHERE id_usuario= ?;";
                            conexion.query(sql2,[id_usuario], function (err, resul) {
                                conexion.release();
                                if (err){
                                    callback(err);
                                }
                                else{
                                    let medallas=[];
                                    resultado.forEach(element => medallas.push({
                                        merito: element.merito,
                                        tipo: element.tipo
                                    }));
                                    resul.forEach(element => medallas.push({
                                        merito: element.merito,
                                        tipo: element.tipo
                                    }));

                                    callback(null, medallas);
                                }
                            });

                        
                        }
                    }
                
                });//END QUERY                
        
            }
        });//END GET CONEXION
    }
}

module.exports = DAOUsers;