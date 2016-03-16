## aj.garcialagar.es theme

Clean blog theme is a ported theme to Spress designed by [Start Bootstrap](http://startbootstrap.com/).

### Features

* Fully responsive.
* Distraction free blog text optimized for legibility.
* Comments powered by [Disqus](disqus.com).

## Configuration

### Comments

Comments are powered by [Disqus](disqus.com) and they need a
**disqus shortname**. To get it, you need to create an account at this service.
It's free.

```yaml
comments:
  enabled: true
  disqus_shortname: "your-shortname"
```


### Google Analytics

To enable google analytics, you need to provide your tracking ID and optionally your domain.

```yaml
google_analytics:
    enabled: true
    id: UA-10547802-1
    domain: aj.garcialagar.es
```

### Top menu

The top menu is composed by each of **pages with `title` attribute**. e.g: `./src/content/about.md`:

```yaml
title: "About me"
```

### Contact form

The contact form is a AJAX form configured in `config.yml`:

```yaml
forms:
    contact:
        getsimpleform_api_token:
```

You need a API key from [getsimpleform](https://getsimpleform.com/) service. It's free.

### Writing a post

To create a new post, runs `new:post` command from Spress:

```bash
$> spress new:site
```

Each post has a header image. You can configure your image and some data about it.

```yaml
header_img:
  url: "assets/img/post-bg-07.jpg"
  author: "Yuri Samoilov"
  author_url: "https://flic.kr/p/mjhDwB"
```

## License

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0).
