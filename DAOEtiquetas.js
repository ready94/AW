"use strict";

class DAOEtiquetas {

    constructor(pool) {
        this.pool = pool;
    }

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

   /* etiquetaMaxRepe(idUser,callback){

        this.pool.getConnection(function (error, conexion) {

            if(error){
                callback(error);
            }else{
                console.log("maxRepe");
                console.log(idUser);
                this.getEtiquetaUser(idUser,function(error,resultado){
                    console.log("holi");
                    if(error){
                        callback(error);
                    }else{
        
                        
                })
            }

        });//END GET CONEXION
        
      
    }*/


    getEtiquetaUser(idUser,callback){
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
                
                const sql= "SELECT etiqueta FROM etiquetas WHERE id_usuario=" + idUser + " ORDER BY etiqueta;";
                conexion.query(sql, function (err, resultado) {
                    conexion.release();
                    if (err)
                        callback(err);
                    else {

                        console.log("etiquetas:",resultado);
                        var etiqueta=[];
                        resultado.forEach((e)=>{
                            etiqueta.push(e);
                        })
        
                        var max=0;
                        var cont=0;
                        var aux=etiqueta[0];
                        console.log(aux);
                        for(var i=1; i< etiqueta.length;i++){
                            if(etiqueta[i]==etiqueta[i--]){
                                cont++;
                                if(cont>max){
                                    max=cont;  
                                    aux=etiqueta[i];
                                }
                                
                            }
                            else{
                                cont=1;
                            }
                        }
        
                        console.log("etiqueta",aux);
                        callback(null,aux);
                    }
                
                });//END QUERY                
               
            }
        });//END GET CONEXION
    }

    
}

module.exports = DAOEtiquetas;