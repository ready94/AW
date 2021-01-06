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
            
            const sql = "SELECT p.id_pregunta, p.id_usuario, p.titulo, p.cuerpo,p.fecha,u.nombre,u.imagen FROM preguntas AS p JOIN usuario AS u ON p.id_usuario=u.id_usuario ORDER BY p.fecha;"; 

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

}

module.exports = DAORespuestas;