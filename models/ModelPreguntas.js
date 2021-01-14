"use strict";

const e = require("express");

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
            //contador de preguntas
            
            const sql = "SELECT p.id_pregunta, p.id_usuario, p.titulo, p.cuerpo,p.fecha,u.nombre,u.imagen FROM preguntas AS p JOIN usuario AS u ON p.id_usuario=u.id_usuario ORDER BY p.fecha DESC;"; 

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

    getByIdPregunta(id, callback){
        this.pool.getConnection(function (err, conexion) {
            
            if (err) {
                callback(err);
            } else {
                // devuelve el usuario entero cuyo email es el pasado por parametro
                const sql = "SELECT * FROM preguntas WHERE id_pregunta = ?;";

                conexion.query(sql,[id], function (err, resultado) {
                    conexion.release();
                    if (err) 
                        callback(err);
                    else 
                        callback(null, resultado);
                }); 
            }
        }); 
    }

    getPreguntaInformacion(id,callback){
        this.pool.getConnection(function (err, conexion) {
            
            if (err)
                callback(err);
            else {
            //contador de preguntas
            
            const sql = "SELECT p.id_pregunta, p.id_usuario, p.titulo, p.cuerpo,p.fecha, p.visitas,u.nombre,u.imagen FROM preguntas AS p JOIN usuario AS u ON p.id_usuario=u.id_usuario WHERE p.id_pregunta= ? ORDER BY p.fecha DESC;"; 
            
                conexion.query(sql, [id],function (err, resultado) {
                    conexion.release();
                    if (err)
                        callback(err);
                    else
                        callback(null, resultado);    
                });              
            }
        });
    }

    //Recoge todas las preguntas almacenadas en la BBDD que contengan un texto específico
    getPreguntasPorTexto(texto, callback){
        
        this.pool.getConnection(function (err, conexion) {
            
            if (err)
                callback(err);
            else {
            //contador de preguntas
            
            const sql = "SELECT p.id_pregunta, p.id_usuario, p.titulo, p.cuerpo,p.fecha,u.nombre,u.imagen FROM preguntas AS p JOIN usuario AS u ON p.id_usuario=u.id_usuario WHERE p.titulo LIKE '%"+texto+"%' OR p.cuerpo LIKE '%"+texto+"%' ORDER BY p.fecha DESC;"; 
            
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

    //Recoge todas las preguntas almacenadas en la BBDD que contengan una etiqueta específica
    getPreguntasByEtiqueta(etiqueta,callback) {
        
        this.pool.getConnection(function (err, conexion) {
            
            if (err)
                callback(err);
            else {
                //contador de preguntas
                
                const sql = "SELECT * FROM preguntas AS p JOIN usuario AS u ON p.id_usuario=u.id_usuario JOIN etiquetas AS e ON p.id_pregunta=e.id_pregunta AND e.etiqueta= ? ORDER BY p.fecha DESC;"; 
                
                conexion.query(sql,[etiqueta], function (err, resultado) {
                    conexion.release();
                    if (err)
                        callback(err);
                    else
                        callback(null, resultado);  
                });   
            }
        });
    }

    //Recoge todas las preguntas almacenadas en la BBDD que no tengan una respuesta
    getPreguntasSinResponder(callback) {
        this.pool.getConnection(function (err, conexion) {
            
            if (err)
                callback(err);
            else {
            //contador de preguntas
            
            const sql = "SELECT p.id_pregunta, p.id_usuario, p.titulo, p.cuerpo,p.fecha,u.nombre,u.imagen FROM preguntas AS p JOIN usuario AS u ON p.id_usuario=u.id_usuario WHERE p.respuesta=FALSE ORDER BY p.fecha DESC;"; 

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

    insertPregunta(id_usuario, titulo, cuerpo, fecha, callback){
        this.pool.getConnection(function (err, conexion) {
            
            if (err)
                callback(err);
            else {

                const sql = "INSERT INTO preguntas (id_usuario, titulo, cuerpo, fecha) VALUES (?, ?, ?, ?);";
               
                var para = [id_usuario, titulo, cuerpo, fecha];

                conexion.query(sql, para, function (err, resultado) {
                    if (err)
                        callback(err);
                    else {
                        const sql2 = "UPDATE usuario SET num_preguntas=num_preguntas+1 WHERE id_usuario=?;"

                        conexion.query(sql2, [id_usuario], function (err, resultado) {
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

    count(callback){
        this.pool.getConnection(function (err, conexion) {
            
            if (err)
                callback(err);
            else {
            //contador de preguntas
                const sql =  "SELECT count (*) as Total FROM preguntas;"; 
               
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

    countEtiquetas(etiqueta,callback){
        this.pool.getConnection(function (err, conexion) {
            
            if (err)
                callback(err);
            else {
            //contador de preguntas
                const sql =  "SELECT count (*) as TotalEtiquetas FROM etiquetas WHERE etiqueta= ?;";
               
                conexion.query(sql,[etiqueta], function (err, resultado) {
                    conexion.release();
                    if (err)
                        callback(err);
                    else
                        callback(null, resultado);  
                });
            }
        });
    }

    countTexto(texto,callback){
        this.pool.getConnection(function (err, conexion) {
            
            if (err)
                callback(err);
            else {
                const sql =  "SELECT count (*) as TotalTexto FROM preguntas WHERE titulo LIKE '%"+texto+"%' OR cuerpo LIKE '%"+texto+"%';"; 
               
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

    countSinResponder(callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
                const sql =  "SELECT count (*) as TotalSinResponder FROM preguntas WHERE respuesta=FALSE;"; 
               
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

    getDatosVisitas(idPre,callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
            
                const sql = "SELECT merito, tipo FROM medallas_preguntas WHERE id_pregunta= ?;"; 
               
                conexion.query(sql,[idPre], function (err, resultado) {
                    
                    if (err)
                        callback(err);
                    else
                        callback(null,resultado);
                });                  
            }
        });
    }

    actualizarVisitas(visitas,id,callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
            //contador de preguntas
                const sql ="UPDATE preguntas SET visitas=? WHERE id_pregunta= ?;"; 
               
                conexion.query(sql,[visitas,id], function (err, resultado) {
                    conexion.release();
                    if (err)
                        callback(err);
                    else
                        callback(null, resultado);  
                }); 
            }
        });
    }

    getDatosVotarPreguntas(id, callback){
        this.pool.getConnection(function (err, conexion) {

            if (err) {
                callback(err);
            } else {
                // devuelve el usuario entero cuyo email es el pasado por parametro
                const sql = "SELECT p.TotalPuntos, u.id_usuario, u.reputacion FROM preguntas AS p JOIN usuario AS u ON p.id_usuario=u.id_usuario WHERE id_pregunta = ?;";

                conexion.query(sql, [id], function (err, resultado) {
                    if (err) 
                        callback(err);
                    else {
                        const sql2 = "SELECT m.tipo, m.merito FROM medallas_preguntas AS m JOIN preguntas AS p ON m.id_pregunta=p.id_pregunta WHERE m.id_pregunta=? ";
                        
                        conexion.query(sql2, [id],function(error,resul){
                            conexion.release();

                            if(error)
                                callback(error);
                            else{
                                var datos = {
                                    id_usuario: resultado[0].id_usuario,
                                    total_puntos:resultado[0].TotalPuntos,
                                    reputacion: resultado[0].reputacion,
                                    resul: resul
                                }
                                callback(null,datos);
                            }
                        })
                    }
                }); 
            }
        }); 
    }

    actualizarDatosPreguntas(id, idUser, voto, reputacion, callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
            //contador de preguntas
                const sql ="UPDATE preguntas SET TotalPuntos=? WHERE id_pregunta=?;"; 
                conexion.query(sql,[voto,id], function (err, resultado) {
                    
                    if (err)
                        callback(err);
                    else{
                        const sql2 ="UPDATE usuario SET reputacion=? WHERE id_usuario=?;"; 
                        conexion.query(sql2,[reputacion,idUser], function (err, resultado) {
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

    insertarMedallaPregunta(id,idUsu,merito,tipo,fecha,callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
                const sql = "INSERT INTO medallas_preguntas (id_pregunta,id_usuario,merito,tipo,fecha) VALUES (?,?,?,?,?)"; 
                var para = [id, idUsu,merito,tipo,fecha];

                conexion.query(sql, para,function (err, resultado) {
                    if (err)
                        callback(err);
                    else{
                        const sql2 = "DELETE FROM medallas_preguntas WHERE id_pregunta=? AND tipo=0;";
                        conexion.query(sql2, [id],function (err, resultado) {
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

    /*
    ****************************************************************************************************************************************************************
                ETIQUETAS
    ****************************************************************************************************************************************************************                                                                   
    */

   getEtiquetas(id_pregunta,callback) {
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
                const sql = "SELECT * FROM etiquetas WHERE id_pregunta= ?";

                conexion.query(sql,[id_pregunta], function (err, resultado) {
                    if (err)
                        callback(err);
                    else
                        callback(null, resultado);
                });                
                conexion.release();
            }
        });
    }

    getAllEtiquetas(callback) {
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
            
                const sql = "SELECT etiqueta, id_pregunta FROM etiquetas";   
                
                conexion.query(sql, function (err, resultado) {
                    conexion.release();
                    if (err)
                        callback(err);
                    else{
                        let etiqueta=[];

                        resultado.forEach(element => etiqueta.push({
                            id_pregunta: element.id_pregunta,
                            etiqueta: element.etiqueta
                        }));

                        callback(null, etiqueta);
                    }        
                });                
            }
        });
    }

    insertEtiqueta(etiqueta, id_pregunta,id_usuario, callback) {
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {

                const sql = "INSERT INTO etiquetas (etiqueta, id_pregunta,id_usuario) VALUES (?, ?,?);";
                var para = [etiqueta, id_pregunta, id_usuario];

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

    getUltimoID(callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
                const sql="SELECT id_pregunta FROM preguntas ORDER BY id_pregunta DESC LIMIT 1;";
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

    existeEtiqueta(etiqueta, callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
                const sql= "SELECT etiqueta FROM etiquetas WHERE etiqueta=?;";
                conexion.query(sql,[etiqueta] ,function (err, resultado) {
                    if (err)
                        callback(err);
                    else 
                        callback(null, resultado);
                });               
                conexion.release();
            }
        });
    }

    getVotacionPregunta(id_usuario, id_pregunta, callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
                const sql = "SELECT id_pregunta FROM votacion_preguntas WHERE id_usuario= ? AND id_pregunta= ?;";
                conexion.query(sql,[id_usuario,id_pregunta], function (err, resultado) {
                    if (err)
                        callback(err);
                    else 
                        callback(null, resultado);
                });               
                conexion.release();
            }
        });
    }

    insertVotacionPregunta(id_usuario, id_pregunta, callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {

                const sql = "INSERT INTO votacion_preguntas (id_usuario, id_pregunta) VALUES (?, ?);";

                conexion.query(sql, [id_usuario, id_pregunta], function (err, resultado) {
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

module.exports = DAOPreguntas;