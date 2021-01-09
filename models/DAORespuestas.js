"use strict";
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
            
            const sql = "SELECT r.texto,r.fecha_respuesta,u.nombre,u.imagen FROM respuestas AS r JOIN usuario AS u ON r.id_usuario=u.id_usuario  WHERE id_pregunta="+id+" ORDER BY r.fecha_respuesta DESC;"; 

                conexion.query(sql, function (err, resultado) {
                    conexion.release();
                    if (err)
                        callback(err);
                    else{
                        //console.log(resultado);
                        callback(null, resultado);

                    }
                        
                });//END QUERY                
                
            }
        });//END GET CONEXION
    }

    insertRespuesta(idPre,idUsu,texto,fecha,callback){
        this.pool.getConnection(function (err, conexion) {
            
            if (err)
                callback(err);
            else {

                const sql = "INSERT INTO respuestas (id_pregunta,id_usuario,texto,fecha_respuesta) VALUES (?,?,?,?);"; 
                var para=[idPre,idUsu,texto,fecha];
                    conexion.query(sql,para, function (err, resultado) {
                        
                        if (err)
                            callback(err);
                        else{
                            //console.log("primer insert bien");
                            //console.log(idPre);
                            const sql2="UPDATE preguntas SET respuesta=TRUE WHERE id_pregunta=? ;";
                            var para2=[idPre];
                            conexion.query(sql2,para2, function (err, resultado) {
                                conexion.release();
                                if (err)
                                    callback(err);
                                else{
                                    //console.log("segundo update");
                                    callback(null, resultado);
                                }
                            });//END QUERY   

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