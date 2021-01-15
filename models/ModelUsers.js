"use strict";

class DAOUsers {

    constructor(pool) {
        this.pool = pool;
    }

    isUserCorrect(email, password, callback) {

        this.pool.getConnection(function(err, connection) {
            if (err) 
                callback(new Error("Error de conexión a la base de datos correct"));
            else {
                const sql="SELECT * FROM usuario WHERE email = ? AND password = ?;"
                connection.query(sql, [email, password],function(err, rows) {
                    connection.release();
                    
                    if (err) 
                        callback(new Error("Error de acceso a la base de datos"));
                    else {
                        if (rows.length === 0) 
                            callback(null, false); 
                        else 
                            callback(null, rows);
                    }
                });
            }
        });
    }

    getUser(email, callback) {
        this.pool.getConnection(function(err, conexion) {
            if (err) 
                callback(err);
            else {
                // devuelve el usuario entero cuyo email es el pasado por parametro
                const sql = "SELECT * FROM usuario WHERE email = ?;";
                conexion.query(sql, [email], function(err, resultado) {
                    conexion.release();
                    if (err) 
                        callback(err);
                    else 
                        callback(null, resultado);
                }); 
            }
        }); 
    }

    getAllUser(callback){
        this.pool.getConnection(function(err, conexion) {
            if (err) 
                callback(err);
            else {
                // devuelve el usuario entero cuyo email es el pasado por parametro
                const sql = "SELECT id_usuario,nombre,imagen,reputacion FROM usuario ORDER BY nombre ASC;"
                
                conexion.query(sql, function(err, resultado) {
                    if (err) 
                        callback(err);
                    else 
                        callback(null, resultado);
                }); 
            }
        }); 
    }

    getUsuariosPorNombre(nombre, callback){
        
        this.pool.getConnection(function (err, conexion) {
            
            if (err)
                callback(err);
            else {
      
                let like= "%"+nombre+"%";
                const sql = "SELECT id_usuario,nombre,imagen,reputacion FROM usuario WHERE nombre LIKE ? ;";
            
                conexion.query(sql,[like], function (err, resultado) {
                    conexion.release();
                    if (err)
                        callback(err);
                    else
                        callback(null, resultado);                        
                });              
            }
        });
    }

    getUserByID(idUsuario, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) 
                callback(err);
            else {
                
                const sql = "SELECT * FROM usuario WHERE id_usuario = ?;";
                conexion.query(sql,[idUsuario], function (err, resultado) {
                    conexion.release();
                    if (err) 
                        callback(err);
                    else 
                        callback(null, resultado);
                }); 
            }
        });
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
                    if (err) 
                        callback(err);
                    else 
                        callback(null, resultado);
                });                
            }
        }); 
    } 

    getReputacion(id, callback) {
        this.pool.getConnection(function (err, conexion) {

            if (err) {
                callback(err);
            } else {
                // devuelve el usuario entero cuyo email es el pasado por parametro
                const sql = "SELECT reputacion FROM usuario WHERE id_usuario = ?;";
                
                conexion.query(sql,[id], function (err, resultado) {
                    conexion.release();
                    if (err) 
                        callback(err);
                    else 
                        callback(null, resultado);
                });
            }
        }); 
    }

    actualizarReputacion(id, reputacion, callback) {
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
                const sql = "UPDATE usuario SET reputacion= ? WHERE id_usuario= ?;";

                conexion.query(sql,[reputacion,id], function (err, resultado) {
                    conexion.release();
                    if (err)
                        callback(err);
                    else 
                        callback(null, resultado);
                });               
            }
        });
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
        
                const sql = "SELECT etiqueta, id_usuario FROM etiquetas ORDER BY id_usuario, etiqueta ASC";   
            
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
                    
                });               
            }
        });
    }

    /*
    ****************************************************************************************************************************************************************
                MEDALLAS
    ****************************************************************************************************************************************************************                                                                   
    */

    getAllMedallas(id_usuario,callback){
        this.pool.getConnection(function (error, conexion) {

            if (error)
                callback(error);
            else {
            
                const sql="SELECT merito,tipo FROM medallas_preguntas WHERE id_usuario= ?;";
                conexion.query(sql,[id_usuario], function (err, resultado) {
                    
                    if (err)
                        callback(err);
                    else{
                        if (error) 
                            callback(error);  
                        else {
                        
                            const sql2 = "SELECT merito,tipo FROM medallas_respuestas WHERE id_usuario= ?;";
                            
                            conexion.query(sql2,[id_usuario], function (err, resul) {
                                conexion.release();
                                if (err)
                                    callback(err);
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
                });               
            }
        });
    }
}

module.exports = DAOUsers;