"use strict";

const e = require("express");

class DAORespuestas{

    constructor(pool) {
        this.pool = pool;
    }

    getRespuestaByPregunta(id,callback){
        this.pool.getConnection(function (err, conexion) {
            
            if (err)
                callback(err);
            else {
            //contador de preguntas
            
            const sql = "SELECT r.texto,r.fecha_respuesta,u.nombre,u.imagen FROM respuestas AS r JOIN usuario AS u ON r.id_usuario=u.id_usuario ORDER BY p.fecha;"; 

                conexion.query(sql, function (err, resultado) {
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

    countRespuestas(id,callback){
        this.pool.getConnection(function (err, conexion) {
            
            if (err)
                callback(err);
            else {
            //contador de preguntas
                const sql =  "SELECT count (*) as TotalRespuestas FROM respuestas WHERE id_pregunta=?;"; 
                var para=[id];
                conexion.query(sql,para, function (err, resultado) {
                    conexion.release();
                    if (err)
                        callback(err);
                    else{
                        //console.log(resultado[0]);
                        callback(null, resultado);
                    }
                        
                });//END QUERY                
                
            }
        });//END GET CONEXION
        
    }

}

module.exports = DAORespuestas;