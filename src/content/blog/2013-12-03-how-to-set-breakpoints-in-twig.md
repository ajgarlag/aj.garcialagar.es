---
title: How to set breakpoints in Twig
date: "2013-12-03T09:30:25+00:00"
author: ajgarlag
layout: post
header_img:
  url: "assets/img/2013-12-03-how-to-set-breakpoints-in-twig/header.jpg"
  author: Chun Xing Wong
  author_url: https://www.flickr.com/photos/wong_chun_xing_arthropods/6054857461
  darken: 0.1
tags:
  - symfony
  - en
---
After last [PHPMad](http://phpmad.org "PHP Madrid User Group") meetup, I was talking with other two group members about our daily work with the [Syfmony](http://www.symfony.com) framework and the Symfony Ecosystem. One of them told me that he loves Twig but sometimes he would like to set a breakpoint in a [Twig](http://twig.sensiolabs.org) template to debug generated code and the variables passed to the template.

Last week I had some time to investigate this and found a simple way to accomplish this creating a **Twig Extension** with a breakpoint function. The code is very simple, just one function that detects if the **XDebug** extension is installed and then calls the **xdebug_break** function to stop the debug sessión. Here is it:

```php
<?php
/**
 * This file is part of the AJ General Libraries
 *
 * Copyright (C) 2010-2013 Antonio J. García Lagar <aj@garcialagar.es>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Antonio J. García Lagar <aj@garcialagar.es>
 */
class Ajgl_Twig_Extension_BreakpointExtension extends Twig_Extension
{
    public function getName()
    {
        return 'breakpoint';
    }

    public function getFunctions()
    {
        return array(
            new Twig_SimpleFunction('breakpoint', array($this, 'setBreakpoint'))
        );
    }

    /**
     * If XDebug is detected, makes the debugger break
     */
    public function setBreakpoint()
    {
        if (function_exists('xdebug_break')) {
            xdebug_break();
        }
    }
}
```

To use it, you only have to register the extension within the Twig loader and call the **breakpoint** function. I've created a new [GitHub](https://github.com/ajgarlag/AjglTwigExtensions "ajgarlag/AjglTwigExtensions") repository with this extensions and another one with a [bundle](https://github.com/ajgarlag/AjglTwigExtensionsBundle "ajgarlag/AjglTwigExtensionsBundle") to integrate the extension into an standard Symfony app.

Feel free to try it and give me some feedback if you want.

### Extra tip for Netbeans users

If you are using Netbeans as your IDE and you want to debug the Twig generated code in an standard Symfony app, you must uncheck the **Ignore &#8220;app/cache&#8221; Directory** inside the _Frameworks/Symfony2_ category in the _Project Properties_ window.
