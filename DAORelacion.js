"use strict";

class DAORelacion {

    constructor(pool) {
        this.pool = pool;
    }

    //Recoge todas las preguntas almacenadas en la BBDD
    getRelaciones(callback) {
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
                //id_usuario, titulo, cuerpo, id_etiquetas, fecha
                var sql = "SELECT * FROM relacion;";  //seleciona todas las preguntas de la base de datos  

                conexion.query("SELECT * FROM relacion;", function (err, resultado) {
                    if (err)
                        callback(err);
                    else
                        callback(null, resultado);
                });//END QUERY                
                conexion.release();
            }
        });//END GET CONEXION
    }

    insertRelacion(id_pregunta, id_etiquetas, callback) {
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {

                var sql = 'INSERT INTO relacion (id_pregunta, id_etiquetas) VALUES (?, ?);';
                var para = [id_pregunta, id_etiquetas];

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

module.exports = DAORelacion;