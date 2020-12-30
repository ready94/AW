"use strict";

class DAOEtiquetas {

    constructor(pool) {
        this.pool = pool;
    }

    //Recoge todas las preguntas almacenadas en la BBDD
    getEtiquetas(callback) {
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
                //id_usuario, titulo, cuerpo, id_etiquetas, fecha
                var sql = "SELECT * FROM etiquetas;";  //seleciona todas las preguntas de la base de datos  

                conexion.query("SELECT * FROM etiquetas;", function (err, resultado) {
                    if (err)
                        callback(err);
                    else
                        callback(null, resultado);
                });//END QUERY                
                conexion.release();
            }
        });//END GET CONEXION
    }

    insertEtiqueta(etiqueta, callback) {
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {

                var sql = 'INSERT INTO etiquetas (etiqueta) VALUES (?);';
                var para = [etiqueta];

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

    existeEtiqueta(etiqueta, callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {

                var sql = 'INSERT INTO etiquetas (etiqueta) VALUES (?);';
                var para = [etiqueta];

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

}

module.exports = DAOEtiquetas;