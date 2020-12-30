"use strict";

class DAOEtiquetas {

    constructor(pool) {
        this.pool = pool;
    }

    //Recoge todas las preguntas almacenadas en la BBDD
    getEtiquetas(callback) {
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {
                //id_usuario, titulo, cuerpo, id_etiquetas, fecha
                var sql = "SELECT * FROM etiquetas;";  //seleciona todas las preguntas de la base de datos  

                conexion.query("SELECT * FROM etiquetas;", function (err, resultado) {
                    if (err)
                        callback(err);
                    else
                        callback(null, resultado);
                });//END QUERY                
                conexion.release();
            }
        });//END GET CONEXION
    }

    insertEtiquetas(etiquetas, callback) {
        this.pool.getConnection(function (err, conexion) {

            if (err)
                callback(err);
            else {

                var sql = 'INSERT INTO etiquetas (etiqueta1, etiqueta2, etiqueta3, etiqueta4, etiqueta5) VALUES (?, ?, ?, ?, ?);';
                var para = [];
                for(var i = 0; i < etiquetas.length; i++)
                    para.push(etiquetas[i]);
                //var para = [etiqueta1, etiqueta2, etiqueta3, etiqueta4, etiqueta5];

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

}

module.exports = DAOEtiquetas;