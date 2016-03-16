---
title: Debug de Symfony con Xdebug
date: "2013-07-12T20:41:50+00:00"
author: ajgarlag
layout: post
header_img:
  url: "assets/img/2013-07-12-debug-de-symfony-con-xdebug/header.jpg"
  author: deSymfony
  author_url: http://www.flickr.com/photos/desymfony/9151048607
  darken: 0.25
tags:
  - symfony
  - es
---
Hace algunas semanas asistí en [#desymfony](http://twitter.com/search?q=%23desymfony)  2013, la [conferencia española de Symfony](http://desymfony.com), a una charla de [@carlos_granados](http://twitter.com/carlos_granados) titulada &#8220;[_Por qué Symfony2 es tan rápido_](http://es.slideshare.net/carlosgranados/por-que-symfony2-es-tan-rpido)&#8221; en la que Carlos nos explicó algunos de los mecanismos internos utilizados por Symfony para acelerar la respuesta a las peticiones HTTP.

Uno de estos mecanismos consiste en copiar en un solo fichero un conjunto de clases que serán, presumiblemente, utilizadas en todas las peticiones al servidor, de modo que con una sola llamada al sistema de ficheros se tienen disponibles todas estas clases, reduciendo así los tiempos de carga de los ficheros. Es un mecanismo sencillo, fácilmente comprensible cuando se conoce, pero puede suponer un quebradero de cabeza si no sabes que existe.

Cuando empecé a enredar con la distribución estándar de Symfony, hace más o menos un año (hasta entonces había trabajado con Zend Framework 1) me costaba entender el mecanismo de control de la ejecución por medio de eventos (además de otras muchas cosas mágicas y oscuras que sucedían dentro del _framework_), por lo que mi primera reacción fue seguir la ejecución de una petición paso a paso con ayuda de Xdebug.

El problema que me encontré era que aunque yo ponía los puntos de interrupción en las líneas de código que me interesaban, estos puntos de interrupción nunca detenían la ejecución del _script_. La razón, sencilla ahora, era que los ficheros en los que yo ponía esos puntos de interrupción nunca se ejecutaban, sino que lo que se ejecutaban eran las copias de esas clases desde los ficheros en los que estaban _cacheadas_ y que permanecían, por defecto, ocultos en mi IDE.

Para simplificar la labor de depurar los recónditos rincones del _framework_ sin necesidad de poner los puntos de interrupción en estos ficheros de caché, la solución era evitar la carga de los mismos comentando la llamada **$kernel->loadClassCache()**; dentro del fichero **web/app_dev.php** pero como no quería que esto sucediera siempre, en lugar de comentar esa línea de código, utilicé un pequeño condicional que detecta cuando está activa la sesión de depuración de Xdebug para evitar la carga de este cache.

Aquí está ese pequeño trozo de código que tantas veces me ha ayudado:

```php
//This check tries to detect a XDebug session to prevent the load of class cache
if (!extension_loaded('xdebug') || (!isset($_REQUEST['XDEBUG_SESSION_START']) && !isset($_COOKIE['XDEBUG_SESSION']) && ini_get('xdebug.remote_autostart') == false)) {
    $kernel->loadClassCache();
}
```
