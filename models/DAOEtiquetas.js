"use strict";

class DAOEtiquetas {

    constructor(pool) {
        this.pool = pool;
    }

    getEtiquetas(id_pregunta,callback) {
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
                
                var sql = "SELECT * FROM etiquetas WHERE id_pregunta= ?";   
                var para=[id_pregunta];
                conexion.query(sql,para, function (err, resultado) {
                    if (err)
                        callback(err);
                    else
                        callback(null, resultado);
                });//END QUERY                
                conexion.release();
            }
        });//END GET CONEXION
    }

    insertEtiqueta(etiqueta, id_pregunta, callback) {
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {

                var sql = 'INSERT INTO etiquetas (etiqueta, id_pregunta) VALUES (?, ?);';
                var para = [etiqueta, id_pregunta];

                conexion.query(sql, para, function (err, resultado) {
                    if (err)
                        callback(err);
                    else {
                        console.log(resultado)
                        callback(null, resultado);
                    }
                });//END QUERY                
                conexion.release();
            }
        });//END GET CONEXION
    }

    getUltimoID(callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
                conexion.query("SELECT id_pregunta FROM preguntas ORDER BY id_pregunta DESC LIMIT 1;", function (err, resultado) {
                    if (err)
                        callback(err);
                    else
                        callback(null, resultado);
                });//END QUERY                
                conexion.release();
            }
        });//END GET CONEXION
    }

    existeEtiqueta(etiqueta, callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
                 const sql= 'SELECT etiqueta FROM etiquetas WHERE etiqueta=' + etiqueta + "';'";
                conexion.query(sql, function (err, resultado) {
                    if (err)
                        callback(err);
                    else {
                        console.log(resultado)
                        callback(null, resultado);
                    }
                });//END QUERY                
                conexion.release();
            }
        });//END GET CONEXION

        
    }

}

module.exports = DAOEtiquetas;