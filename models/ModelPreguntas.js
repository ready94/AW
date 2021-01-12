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
                    else{
                        //console.log(resultado);
                        callback(null, resultado);

                    }
                        
                });//END QUERY                
                
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

    getPreguntaInformacion(id,callback){
        this.pool.getConnection(function (err, conexion) {
            
            if (err)
                callback(err);
            else {
            //contador de preguntas
            
            const sql = "SELECT p.id_pregunta, p.id_usuario, p.titulo, p.cuerpo,p.fecha, p.visitas,u.nombre,u.imagen FROM preguntas AS p JOIN usuario AS u ON p.id_usuario=u.id_usuario WHERE p.id_pregunta="+id+" ORDER BY p.fecha DESC;"; 
            
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
                    else{
                        //console.log(resultado);
                        callback(null, resultado);

                    }
                        
                });//END QUERY                
                
            }
        });//END GET CONEXION

    }

    //Recoge todas las preguntas almacenadas en la BBDD que contengan una etiqueta específica
    getPreguntasByEtiqueta(etiqueta,callback) {
        
        this.pool.getConnection(function (err, conexion) {
            
            if (err)
                callback(err);
            else {
            //contador de preguntas
            
            const sql = "SELECT * FROM preguntas AS p JOIN usuario AS u ON p.id_usuario=u.id_usuario JOIN etiquetas AS e ON p.id_pregunta=e.id_pregunta AND e.etiqueta='"+etiqueta+"' ORDER BY p.fecha DESC;"; 
             
            //const sql2="SELECT * FROM usuario AS u JOIN preguntas AS p ON p.id_usuario=u.id_usuario ORDER BY p.fecha;"; 
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
                    else{
                       // console.log(resultado);
                        callback(null, resultado);

                    }
                        
                });//END QUERY                
                
            }
        });//END GET CONEXION
    }

    insertPregunta(id_usuario, titulo, cuerpo, fecha, callback){
        this.pool.getConnection(function (err, conexion) {
            
            if (err)
                callback(err);
            else {

                const sql = 'INSERT INTO preguntas (id_usuario, titulo, cuerpo, fecha) VALUES (?, ?, ?, ?);';
               
                var para = [id_usuario, titulo, cuerpo, fecha];

                conexion.query(sql, para, function (err, resultado) {
                    if (err)
                        callback(err);
                    else {
                        const sql2= "UPDATE usuario SET num_preguntas=num_preguntas+1 WHERE id_usuario=?;"
                        var para2=[id_usuario];
                        conexion.query(sql2, para2, function (err, resultado) {
                            conexion.release();
                            if (err)
                                callback(err);
                            else {
                                callback(null, resultado);
                            }
                        });
                    }
                });//END QUERY                
                
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
                    conexion.release();
                    if (err)
                        callback(err);
                    else{
                        //console.log(resultado[0]); //comen
                        callback(null, resultado);
                    }
                        
                });//END QUERY                
                
            }
        });//END GET CONEXION
        
    }

    countEtiquetas(etiqueta,callback){
        this.pool.getConnection(function (err, conexion) {
            
            if (err)
                callback(err);
            else {
            //contador de preguntas
                const sql =  "SELECT count (*) as TotalEtiquetas FROM etiquetas WHERE etiqueta= ?;"; 
                var para=[etiqueta];
               
                conexion.query(sql,para, function (err, resultado) {
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

    countTexto(texto,callback){
        this.pool.getConnection(function (err, conexion) {
            
            if (err)
                callback(err);
            else {
            //contador de preguntas
                const sql =  "SELECT count (*) as TotalTexto FROM preguntas WHERE titulo LIKE '%"+texto+"%' OR cuerpo LIKE '%"+texto+"%';"; 
               
                conexion.query(sql, function (err, resultado) {
                    conexion.release();
                    if (err)
                        callback(err);
                    else{
                       // console.log(resultado[0]); //comen
                        callback(null, resultado);
                    }
                        
                });//END QUERY                
                
            }
        });//END GET CONEXION
    }

    countSinResponder(callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
            //contador de preguntas
                var sql =  "SELECT count (*) as TotalSinResponder FROM preguntas WHERE respuesta=FALSE;"; 
               
                conexion.query(sql, function (err, resultado) {
                    conexion.release();
                    if (err)
                        callback(err);
                    else{
                        console.log(resultado[0]); //comen
                        callback(null, resultado);
                    }
                        
                });//END QUERY                
                
            }
        });//END GET CONEXION
    }

    getDatosVisitas(idPre,callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
            //contador de preguntas
                var sql ="SELECT merito, tipo FROM medallas_preguntas WHERE id_pregunta="+idPre+";"; 
               
                conexion.query(sql, function (err, resultado) {
                    
                    if (err)
                        callback(err);
                    else{
                        callback(null,resultado);
                    }
                        
                });//END QUERY                
                
            }
        });//END GET CONEXION
    }

    actualizarVisitas(visitas,id,callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
            //contador de preguntas
                var sql ="UPDATE preguntas SET visitas="+visitas+" WHERE id_pregunta="+id+";"; 
               
                conexion.query(sql, function (err, resultado) {
                    conexion.release();
                    if (err)
                        callback(err);
                    else{
                        //console.log(resultado[0]); //comen
                        callback(null, resultado);
                    }
                        
                });//END QUERY                
                
            }
        });//END GET CONEXION
    }

    getDatosVotarPreguntas(id, callback){
        this.pool.getConnection(function (err, conexion) {

            if (err) {
                callback(err);
            } else {
                // devuelve el usuario entero cuyo email es el pasado por parametro
                var sql = "SELECT p.TotalPuntos, u.id_usuario, u.reputacion FROM preguntas AS p JOIN usuario AS u ON p.id_usuario=u.id_usuario WHERE id_pregunta = ?;";
                var para = [id];
                conexion.query(sql, para, function (err, resultado) {
                    if (err) {
                        callback(err);
                    } else {
                        const sql2="SELECT m.tipo, m.merito FROM medallas_preguntas AS m JOIN preguntas AS p ON m.id_pregunta=p.id_pregunta WHERE m.id_pregunta=? ";
                        conexion.query(sql2,para,function(error,resul){
                            conexion.release();
                            if(error){
                                callback(error);
                            }else{
                               

                                //console.log("medalla",medalla);
                                //console.log("resultado:",resultado)
                                var datos={
                                    id_usuario: resultado[0].id_usuario,
                                    total_puntos:resultado[0].TotalPuntos,
                                    reputacion: resultado[0].reputacion,
                                    resul: resul
                                }

                                //console.log("datos:",datos);
                                callback(null,datos);

                            }
                        })

                    }
                }); //END QUERY

            }
        }); //END GET CONEXION
    }

    actualizarDatosPreguntas(id,idUser,voto,reputacion,callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
            //contador de preguntas
                var sql ="UPDATE preguntas SET TotalPuntos="+voto+" WHERE id_pregunta="+id+";"; 
                conexion.query(sql, function (err, resultado) {
                    
                    if (err)
                        callback(err);
                    else{
                        var sql2 ="UPDATE usuario SET reputacion="+reputacion+" WHERE id_usuario="+idUser+";"; 
                        conexion.query(sql2, function (err, resultado) {
                            conexion.release();
                            if (err)
                                callback(err);
                            else{
                                callback(null, resultado);
                            }
                        });
                    }
                        
                });//END QUERY                
                
            }
        });//END GET CONEXION
    }

    insertarMedallaPregunta(id,fecha,merito,tipo,callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
                const sql ="INSERT INTO medallas_preguntas (id_pregunta,fecha,tipo,merito) VALUES (?,?,?,?)"; 
                var para=[id,fecha,tipo,merito];
                conexion.query(sql, para,function (err, resultado) {
                    if (err)
                        callback(err);
                    else{
                        const sql2="DELETE FROM medallas_preguntas WHERE id_pregunta="+id+" AND tipo=0;";
                        conexion.query(sql2, para,function (err, resultado) {
                            conexion.release();
                            if (err)
                                callback(err);
                            else{
                                callback(null, resultado);
                            }
                        });
                        
                    }
                        
                });//END QUERY                
                
            }
        });//END GET CONEXION
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
            
            var sql = "SELECT * FROM etiquetas WHERE id_pregunta= ?";   
            var para=[id_pregunta];
            conexion.query(sql,para, function (err, resultado) {
                if (err)
                    callback(err);
                else
                    callback(null, resultado);
            });//END QUERY                
            conexion.release();
        }
    });//END GET CONEXION
    }

    getAllEtiquetas(callback) {
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
            
                var sql = "SELECT etiqueta, id_pregunta FROM etiquetas";   
                
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
                        
                });//END QUERY                
                
            }
        });//END GET CONEXION
    }


insertEtiqueta(etiqueta, id_pregunta, callback) {
    this.pool.getConnection(function (err, conexion) {

        if (err)
            callback(err);
        else {

            var sql = 'INSERT INTO etiquetas (etiqueta, id_pregunta) VALUES (?, ?);';
            var para = [etiqueta, id_pregunta];

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

getUltimoID(callback){
    this.pool.getConnection(function (err, conexion) {

        if (err)
            callback(err);
        else {
            conexion.query("SELECT id_pregunta FROM preguntas ORDER BY id_pregunta DESC LIMIT 1;", function (err, resultado) {
                if (err)
                    callback(err);
                else
                    callback(null, resultado);
            });//END QUERY                
            conexion.release();
        }
    });//END GET CONEXION
}

existeEtiqueta(etiqueta, callback){
    this.pool.getConnection(function (err, conexion) {

        if (err)
            callback(err);
        else {
             const sql= 'SELECT etiqueta FROM etiquetas WHERE etiqueta=' + etiqueta + "';'";
            conexion.query(sql, function (err, resultado) {
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