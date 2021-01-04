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
                var sql =  "SELECT  id_pregunta,id_usuario, titulo, cuerpo, fecha FROM preguntas;";  //seleciona todas las preguntas de la base de datos  

                conexion.query(sql, function (err, resultado) {
                    if (err)
                        callback(err);
                    else{

                        var orden= "SELECT * FROM preguntas ORDER BY fecha;";
                        conexion.query(orden, function (err, resultado) {
                            if (err)
                                callback(err);
                            else{
                                
                                callback(null, resultado);
                            }
                        });//END QUERY    
                    }
   
                });//END QUERY                
                conexion.release();
            }
        });//END GET CONEXION
    }

    getByIdPregunta(id, callback){
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                callback(err);
            } else {
                // devuelve el usuario entero cuyo email es el pasado por parametro
                var sql = "SELECT * FROM preguntas WHERE id_pregunta = ?;";
                var para = [id];
                conexion.query(sql, para, function (err, resultado) {
                    if (err) {
                        callback(err);
                    } else {
                        console.log(resultado);
                        callback(null, resultado);

                    }
                }); //END QUERY
                conexion.release();
            }
        }); //END GET CONEXION
    }

    //Recoge todas las preguntas almacenadas en la BBDD que contengan un texto específico
    getPreguntasPorTexto(texto, callback){

        this.pool.getConnection(function (err, conexion) {
            if (err) {
                callback(err);
            }else {
 
                var sql = "SELECT * FROM preguntas WHERE titulo LIKE '%"+texto+"%' OR cuerpo LIKE '%"+texto+"%';";
                
                conexion.query(sql, function (err, resultado) {
                    if (err) {
                        callback(err);
                    } else {
                        //console.log(resultado);
                        callback(null, resultado);

                    }
                }); //END QUERY
            conexion.release();
            }
        }); //END GET CONEXION

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

                var sql = 'INSERT INTO preguntas (id_usuario, titulo, cuerpo, fecha) VALUES (?, ?, ?, ?);';
               
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
                var sql =  "SELECT count (*) as Total FROM preguntas;"; 
               
                conexion.query(sql, function (err, resultado) {
                    if (err)
                        callback(err);
                    else{
                        console.log(resultado[0]); //comen
                        callback(null, resultado);
                    }
                        
                });//END QUERY                
                conexion.release();
            }
        });//END GET CONEXION
        
    }

    countEtiquetas(callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
            //contador de preguntas
                var sql =  "SELECT count (*) as TotalEtiquetas FROM preguntas;"; 
               
                conexion.query(sql, function (err, resultado) {
                    if (err)
                        callback(err);
                    else{
                        console.log(resultado[0]); //comen
                        callback(null, resultado);
                    }
                        
                });//END QUERY                
                conexion.release();
            }
        });//END GET CONEXION
    }

    countTexto(texto,callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
            //contador de preguntas
                var sql =  "SELECT count (*) as TotalTexto FROM preguntas WHERE titulo LIKE '%"+texto+"%' OR cuerpo LIKE '%"+texto+"%';"; 
               
                conexion.query(sql, function (err, resultado) {
                    if (err)
                        callback(err);
                    else{
                       // console.log(resultado[0]); //comen
                        callback(null, resultado);
                    }
                        
                });//END QUERY                
                conexion.release();
            }
        });//END GET CONEXION
    }

    countSinResponder(callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
            //contador de preguntas
                var sql =  "SELECT count (*) as TotalSinResponder FROM preguntas;"; 
               
                conexion.query(sql, function (err, resultado) {
                    if (err)
                        callback(err);
                    else{
                        console.log(resultado[0]); //comen
                        callback(null, resultado);
                    }
                        
                });//END QUERY                
                conexion.release();
            }
        });//END GET CONEXION
    }

}

module.exports = DAOPreguntas;