"use strict";

class DAOPreguntas{

    constructor(pool) {
        this.pool = pool;
    }

    //Recoge todas las preguntas almacenadas en la BBDD
    getPreguntas(callback) {
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {

                var sql = 'SELECT idP, pregunta FROM preguntas;'  //seleciona todas las preguntas de la base de datos  

                conexion.query(sql, function (err, resultado) {
                    if (err)
                        callback(err);
                    else
                        callback(null, resultado);
                });//END QUERY                
                conexion.release();
            }
        });//END GET CONEXION
    }

    //Recoge todas las preguntas almacenadas en la BBDD que contengan un texto específico
    getPreguntasPorTexto(){

    }

    //Recoge todas las preguntas almacenadas en la BBDD que contengan una etiqueta específica
    getPreguntasPorEtiqueta() {

    }

    //Recoge todas las preguntas almacenadas en la BBDD que no tengan una respuesta
    getPreguntasSinResponder() {

    }

    insertPregunta(){

    }

}