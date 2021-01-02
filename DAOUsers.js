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
                    if (err) {
                        callback(err);
                    } else {
                        /*console.log(resultado);*/
                        callback(null, resultado);

                    }
                }); //END QUERY
                conexion.release();
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
                    if (err) {
                        callback(err);
                    } else {
                      /*  console.log(resultado);*/
                        callback(null, resultado);

                    }
                }); //END QUERY
                conexion.release();
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
                        if (err) {
                            callback(err);
                        } else {
                            console.log(resultado)
                            callback(null, resultado);
                        }
                    }); //END QUERY                
                    conexion.release();
                }
            }); //END GET CONEXION

        } //END METODO

}

module.exports = DAOUsers;