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
            
            const sql = "SELECT r.id_respuesta, r.texto,r.fecha_respuesta,u.nombre,u.imagen FROM respuestas AS r JOIN usuario AS u ON r.id_usuario=u.id_usuario  WHERE id_pregunta="+id+" ORDER BY r.fecha_respuesta DESC;"; 

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
                                
                                if (err)
                                    callback(err);
                                else{
                                    const sql3="UPDATE usuario SET num_respuestas=num_respuestas+1 WHERE id_usuario=?;";
                                    var para3=[idUsu];
                                    conexion.query(sql3,para3, function (err, resultado) {
                                        conexion.release();
                                        if(err){
                                            callback(err);
                                        }
                                        else{
                                            callback(null, resultado);
                                        }
                                    });

                                    
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

    getVotosAndIdUser(id, callback) {
        this.pool.getConnection(function (err, conexion) {

            if (err) {
                callback(err);
            } else {
                // devuelve el usuario entero cuyo email es el pasado por parametro
                var sql = "SELECT TotalPuntos, id_usuario FROM respuestas WHERE id_respuesta = ?;";
                var para = [id];
                conexion.query(sql, para, function (err, resultado) {
                    conexion.release();
                    if (err) {
                        callback(err);
                    } else {
                        console.log(resultado);
                        callback(null, resultado);

                    }
                }); //END QUERY

            }
        }); //END GET CONEXION
    }

    actualizarVotos(id, voto, callback) {
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
                //contador de preguntas
                var sql = "UPDATE respuestas SET TotalPuntos=" + voto + " WHERE id_respuesta=" + id + ";";

                conexion.query(sql, function (err, resultado) {
                    conexion.release();
                    if (err)
                        callback(err);
                    else {
                        //console.log(resultado[0]); //comen
                        callback(null, resultado);
                    }

                });//END QUERY                

            }
        });//END GET CONEXION
    }

}

module.exports = DAORespuestas;