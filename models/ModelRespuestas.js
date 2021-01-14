"use strict";
class DAORespuestas{

    constructor(pool) {
        this.pool = pool;
    }

    getRespuestaByPregunta(id, callback){
        this.pool.getConnection(function (err, conexion) {
            
            if (err)
                callback(err);
            else {
                //contador de preguntas
                const sql = "SELECT r.id_respuesta, r.texto, r.fecha_respuesta, u.nombre, u.imagen FROM respuestas AS r JOIN usuario AS u ON r.id_usuario=u.id_usuario  WHERE id_pregunta=" + id + " ORDER BY r.fecha_respuesta DESC;"; 

                conexion.query(sql, function (err, resultado) {
                    conexion.release();
                    if (err)
                        callback(err);
                    else
                        callback(null, resultado);     
                });                 
            }
        });
    }

    insertRespuesta(idPre, idUsu, texto, fecha, callback){
        this.pool.getConnection(function (err, conexion) {
            
            if (err)
                callback(err);
            else {

                const sql = "INSERT INTO respuestas (id_pregunta,id_usuario,texto,fecha_respuesta) VALUES (?,?,?,?);"; 
                var para = [idPre, idUsu, texto, fecha];

                conexion.query(sql,para, function (err, resultado) {
                    
                    if (err)
                        callback(err);
                    else{
                        const sql2 = "UPDATE preguntas SET respuesta=TRUE WHERE id_pregunta=? ;";
                        var para2 = [idPre];

                        conexion.query(sql2, para2, function (err, resultado) {
                            
                            if (err)
                                callback(err);
                            else{
                                const sql3 = "UPDATE usuario SET num_respuestas=num_respuestas+1 WHERE id_usuario=?;";
                                var para3 = [idUsu];

                                conexion.query(sql3, para3, function (err, resultado) {
                                    conexion.release();
                                    if(err)
                                        callback(err);
                                    else
                                        callback(null, resultado);
                                }); 
                            }
                        }); 
                    } 
                });   
            }
        });
    }

    countRespuestas(id,callback){
        this.pool.getConnection(function (err, conexion) {
            
            if (err)
                callback(err);
            else {
            //contador de preguntas
                const sql =  "SELECT count (*) as TotalRespuestas FROM respuestas WHERE id_pregunta=?;"; 
                var para = [id];

                conexion.query(sql, para, function (err, resultado) {
                    conexion.release();
                    if (err)
                        callback(err);
                    else
                        callback(null, resultado);
                });                
            }
        });
    }

    getDatosVotarRespuestas(id, callback){
        this.pool.getConnection(function (err, conexion) {

            if (err) {
                callback(err);
            } else {
                // devuelve el usuario entero cuyo email es el pasado por parametro
                var sql = "SELECT r.TotalPuntos, r.id_pregunta, u.id_usuario, u.reputacion FROM respuestas AS r JOIN usuario AS u ON r.id_usuario=u.id_usuario WHERE r.id_respuesta = ?;";
                var para = [id];

                conexion.query(sql, para, function (err, resultado) {
                    if (err) {
                        callback(err);
                    } else {
                        const sql2 = "SELECT m.tipo, m.merito FROM medallas_respuestas AS m JOIN respuestas AS r ON m.id_respuesta=r.id_respuesta WHERE m.id_respuesta=? ";
                        
                        conexion.query(sql2,para,function(error,resul){
                            conexion.release();
                            if(error)
                                callback(error);
                            else{
                
                                var datos = {
                                    id_usuario: resultado[0].id_usuario,
                                    id_pregunta:  resultado[0].id_pregunta,
                                    total_puntos:resultado[0].TotalPuntos,
                                    reputacion: resultado[0].reputacion,
                                    resul: resul
                                }
                                callback(null,datos);
                            }
                        });
                    }
                }); 
            }
        }); 
    }

    actualizarDatosRespuestas(idRes, idUser, voto, reputacion, callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
            //contador de preguntas
                var sql = "UPDATE respuestas SET TotalPuntos=" + voto + " WHERE id_respuesta=" + idRes + ";"; 
                conexion.query(sql, function (err, resultado) {
                    
                    if (err)
                        callback(err);
                    else{
                        var sql2 = "UPDATE usuario SET reputacion=" + reputacion + " WHERE id_usuario=" + idUser + ";"; 
                        conexion.query(sql2, function (err, resultado) {
                            conexion.release();
                            if (err)
                                callback(err);
                            else
                                callback(null, resultado);
                        });
                    }
                });
            }
        });
    }

    insertarMedallaRespuesta(id, idUser , merito, tipo,fecha, callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
                const sql = "INSERT INTO medallas_respuestas (id_respuesta, id_usuario, merito,tipo,fecha) VALUES (?, ?, ?, ?, ?)"; 
                var para = [id,idUser, merito,tipo, fecha];

                conexion.query(sql, para,function (err, resultado) {
                    conexion.release();
                    if (err)
                        callback(err);
                    else
                        callback(null, resultado);
                });
            }
        });
    }

    getVotacionRespuesta(id_usuario, id_respuesta, callback) {
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
                const sql = "SELECT id_respuesta FROM votacion_respuestas WHERE id_usuario=" + id_usuario + " AND id_respuesta=" + id_respuesta + ";";
                conexion.query(sql, function (err, resultado) {
                    if (err)
                        callback(err);
                    else 
                        callback(null, resultado);
                });             
                conexion.release();
            }
        });
    }

    insertVotacionRespuesta(id_usuario, id_respuesta, callback) {
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {

                var sql = 'INSERT INTO votacion_respuestas (id_usuario, id_respuesta) VALUES (?, ?);';
                var para = [id_usuario, id_respuesta];

                conexion.query(sql, para, function (err, resultado) {
                    if (err)
                        callback(err);
                    else 
                        callback(null, resultado);
                });                
                conexion.release();
            }
        });
    }
}

module.exports = DAORespuestas;