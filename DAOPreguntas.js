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
                var sql =  "SELECT id_usuario, titulo, cuerpo, fecha FROM preguntas;";  //seleciona todas las preguntas de la base de datos  

                conexion.query("SELECT id_usuario, titulo, cuerpo, fecha FROM preguntas;", function (err, resultado) {
                    if (err)
                        callback(err);
                    else{

                        var orden= "SELECT * FROM preguntas ORDER BY fecha;";
                        conexion.query(orden, function (err, resultado) {
                            if (err)
                                callback(err);
                            else{
                                console.log(resultado);
                                callback(null, resultado);
                            }
                        });//END QUERY    
                    }
   
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

    insertPregunta(id_usuario, titulo, cuerpo, fecha, callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {

                var sql = 'INSERT INTO preguntas (id_usuario, titulo, cuerpo, fecha) VALUES (?, ?, ?, ?, ?);';
                var para = [id_usuario, titulo, cuerpo, fecha];

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

    count(callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
            //contador de preguntas
                var sql =  'SELECT COUNT(id_pregunta) FROM preguntas;'; 

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

}

module.exports = DAOPreguntas;