const express = require('express');
const app = express();

//Modulos importados
const User = require('./user');
const Auth = require('./auth');
const WebView = require('./webViews');
const Producto = require('./productos');
const log = require('./logs')
const MGM = require('./MGM')

//creacion de la ruta principal de cada modulo
app.use('/Usuarios', User);
app.use('/Auth', Auth );
app.use('/WebView', WebView );
app.use('/Productos', Producto );
app.use('/Logs', log );
app.use('/MGM', MGM)


module.exports = app;