---
title: Debugging Symfony with XDebug
description: "How to set breakpoint in your Symfony apps avoiding the class cache when a running Xdebug session is detected."
date: "2013-11-15T20:54:12+00:00"
author: ajgarlag
layout: post
header_img:
  url: "assets/img/2013-11-15-debugging-symfony-with-xdebug-2/header.jpg"
  author: Javi
  author_url: https://www.flickr.com/photos/javism/228077705
tags:
  - symfony
  - php
  - en
redirect_from: /blog/debugging-symfony-with-xdebug-2/
comment_posts:
  - author: Tobias Sjösten
    date: "2015-01-06T12:31:17+00:00"
    message: |
      <p>Excellent addition! I'm updating all my front dev controllers.</p>
---
Some months ago, I wrote a post in Spanish about debugging Symfony apps with XDebug with the hope that I would translate it to English soon. Well, not as soon as I wished,but here is it.

Whe I started to work with the Symfony standard distribution, 18 months ago (I used to work with Zend Framework 1 before), I didn’t understand the event controlled execution flow (beside other dark magics inside the framework), so the first thing I tried was to debug a full request with the help of XDebug.

The problem was that, although I set the breakpoints in every interesting line of code, these breakpoints were completely ignored. The reason, easy to understand now than I know it, was that the files with the breakpoints were never executed. They were being cached to another location to accelerate the framework and this location was hidden for mi IDE.

To simplify my debugging work of the hidden corners of the framework, without the need of setting breakpoints it those cache files, the solution was to skip the cache files with a comment to the **$kernel->loadClassCache();** inside the **web/app_dev.php** file. But I wanted to avoid the cache only when the XDebug session was running, so I wrote a little conditional expression to detect it.

Here is the snippet that helped me a lot to understand how Symfony works:

```php
//This check tries to detect a XDebug session to prevent the load of class cache
if (
    !extension_loaded('xdebug') ||
    (
        !isset($_REQUEST['XDEBUG_SESSION_START']) &&
        !isset($_COOKIE['XDEBUG_SESSION']) &&
        ini_get('xdebug.remote_autostart') == false
    )
) {
    $kernel->loadClassCache();
}
```
