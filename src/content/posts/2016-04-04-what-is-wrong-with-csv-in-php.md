---
layout: post
title: "What is wrong with CSV in PHP"
description: "PHP CSV functions has some little gotchas related to the escape character that can lead you to unexpected results."
date: "2016-04-04T18:11:23+00:00"
author: ajgarlag
header_img:
  url: "assets/img/2016-04-04-what-is-wrong-with-csv-in-php/header.jpg"
  author: Arnold Reinhold
  author_url: https://commons.wikimedia.org/wiki/File:Abramowitz%26Stegun.page97.agr.jpg
  darken: 0.4
tags:
  - en
  - php
---
The PHP implementation of CSV functions has some little gotchas related to the escape character that can lead you to unexpected results if you exchange CSV data with applications not written in PHP.

## RFC 4180: Common Format and MIME Type for Comma-Separated Values (CSV) Files

To illustrate the issue, I've created a simple [Google Spreadsheet](https://goo.gl/j50MKc) document with a single field filled with the following text `"Hello\", World!`.

If you [download](https://goo.gl/H4ni63) it as CSV, the Google servers will generate a file that adheres to the [RFC 4180](https://www.ietf.org/rfc/rfc4180.txt) Common Format and MIME Type for Comma-Separated Values (CSV) Files.

Now, to read it with the PHP [`fgetcsv`](http://php.net/manual/en/function.fgetcsv.php) function, we must use a double-quote (`“`) as the escape character because the RFC states that:

> If double-quotes are used to enclose fields, then a double-quote appearing inside a field must be escaped by preceding it with another double quote.

So let's try this code snippet:
```php
<?php
$fp = fopen('https://goo.gl/H4ni63', 'r');
echo fgets($fp, 4096).PHP_EOL;
$fp = fopen('https://goo.gl/H4ni63', 'r');
echo fgetcsv($fp, 0, ',', '"', '"')[0].PHP_EOL;
```
Output:
```bash
"""Hello\"", World!"
"Hello\", World!
```

The first line is the raw content of the CSV file; and the second one, the parsed data, so everything works as expected.

## The problem: Trying to write standard CSV files with PHP

Now, let's make the opposite operation, to write the extracted data back to CSV format. Remember that we must use a double-quote as escape character, but here comes the first problem. The `$escape_char` parameter in [`fputcsv`](http://php.net/manual/en/function.fputcsv.php) was added in PHP 5.5.4, so we have two options:

### PHP <5.5.4

```php
<?php
$fp = tmpfile();
fputcsv($fp, array('"Hello\", World!'), ',', '"');
rewind($fp);
echo fgets($fp, 4096);
rewind($fp);
$row = fgetcsv($fp, 0, ',', '"', '"');
echo $row[0].PHP_EOL;
echo $row[1].PHP_EOL;
```
Output:
```
"""Hello\", World!"
"Hello\
 World!"
```
You can see that the first double-quote is escaped with a double-quote, but the second one is escaped with a backslash (`\`), and reading it back will generate a row with two fields. WTF!

### PHP >=5.5.4

```php
<?php
$fp = tmpfile();
fputcsv($fp, array('"Hello\", World!'), ',', '"', '"');
rewind($fp);
echo fgets($fp, 4096);
rewind($fp);
$row = fgetcsv($fp, 0, ',', '"', '"');
echo $row[0].PHP_EOL;
echo $row[1].PHP_EOL;
```
Output:
```
""Hello\", World!"
Hello\"
 World!"
```

The result is even worse, the second double-quote is escaped again with a backslash (`\`), but the first one is not escaped at all, and reading it back will generate a row with two fields again. WTF<sup>2</sup>!

This problem is a known issue, reported in the [50686](https://bugs.php.net/bug.php?id=50686) PHP bug, that is marked as *Wont fix* by the language developers.

## My proposed solution: Writing standard CSV files with AjglCsvRfc

As I needed a workaround for it, I’ve written a small PHP library that provides an alternative implementation for all CSV related functions to write CSV files that can be safely exchanged with applications written in other programming languages.

|Native |Alternative |
|---|---|
|`fgetcsv` |`Ajgl\Csv\Rfc\fgetcsv` |
|`fputcsv` |`Ajgl\Csv\Rfc\fputcsv` |
|`str_getcsv` |`Ajgl\Csv\Rfc\str_getcsv` |
|`SplFileObject::fgetcsv` |`Ajgl\Csv\Rfc\Spl\SplFileObject::fgetcsv` |
|`SplFileObject::fputcsv` |`Ajgl\Csv\Rfc\Spl\SplFileObject::fputcsv` |
|`SplFileObject::setCsvControl` |`Ajgl\Csv\Rfc\Spl\SplFileObject::setCsvControl` |

You can install this library with composer:
```bash
$ composer require ajgl/csv-rfc
```
Now the following code snippet will finally print a well escaped CSV string where both double-quote charaters are successfully escaped following the RFC statement, and when read it back will generate a row with a single field:
```php
<?php
require __DIR__.'/vendor/autoload.php';
use Ajgl\Csv\Rfc;
$fp = tmpfile();
Rfc\fputcsv($fp, array('"Hello\", World!'), ',', '"');
rewind($fp);
echo fgets($fp, 4096);
rewind($fp);
$row = Rfc\fgetcsv($fp, 0, ',', '"', '"');
echo $row[0].PHP_EOL;
```
Output:
```
"""Hello\"", World!"
"Hello\", World!
```

I recommend you to read the README file, and to pay attention to the [End-Of-Line](https://github.com/ajgarlag/AjglCsvRfc#end-of-line-eol) section.

If you find this library useful, please drop a ★ in the [GitHub repository page](https://github.com/ajgarlag/AjglCsvRfc) and/or the [Packagist package page](https://packagist.org/packages/ajgl/csv-rfc).
