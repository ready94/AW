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
//id_usuario, titulo, cuerpo, id_etiquetas, fecha
                var sql =  "SELECT id_usuario, titulo, cuerpo, id_etiquetas, fecha FROM preguntas;";  //seleciona todas las preguntas de la base de datos  

                conexion.query("SELECT id_usuario, titulo, cuerpo, id_etiquetas, fecha FROM preguntas;", function (err, resultado) {
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
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {

                var sql = 'INSERT INTO preguntas (id_isuario, respuesta1, respuesta2, respuesta3) VALUES (?, ?, ?, ?);';//inserta una pregunta con sus respuestas en la base de datos
                var para = [pregunta.Pregunta, pregunta.Respuesta1, pregunta.Respuesta2, pregunta.Respuesta3]

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

module.exports = DAOPreguntas;