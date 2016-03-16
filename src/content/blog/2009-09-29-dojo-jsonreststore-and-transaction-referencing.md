---
title: Dojo, JsonRestStore and transaction referencing
date: "2009-09-29T19:16:10+00:00"
author: ajgarlag
layout: post
tags:
  - dojo
  - js
  - webdev
  - zf
  - en
---
Last weeks I need to work with a tree structure. Since I'm using [Zend Framework](http://framework.zend.com), I decided to use the [Dojo Toolkit](http://www.dojotoolkit.org/) to make it.

After a review of the consistent [<a target="_blank" rel="nofollow" href="http://dojo.data." >dojo.data.</a>api](http://api.dojotoolkit.org/jsdoc/1.3.2/dojo.data.api), I was very impressed because it allow you to reuse your widget with different data stores (XML, JSON, etc.).

I decide to use the Zend_Rest component developed by [Luke Crouch](http://framework.zend.com/wiki/display/~lcrouch) at the server side to make a RESTful web service, and [<a target="_blank" rel="nofollow" href="http://dojox.data." >dojox.data.</a>JsonRestStore](http://api.dojotoolkit.org/jsdoc/1.3.2/dojox.data.JsonRestStore) at the client side to communicate with this service.

The setup of the [tree widget](http://api.dojotoolkit.org/jsdoc/1.3.2/dijit.Tree) is trivial following the dojo documentation:

```javascript
var store = new dojox.data.JsonRestStore({target: "http://example.org/restfulservice");
var model = new dijit.tree.TreeStoreModel({store: store, query:{id:"one"}});
var tree = new dijit.Tree({model: model}, "treeDivId");
```

### How the JsonRestStore works.

The JsonRestStore object support transactions, so you can create and modify several nodes and then call the **<a target="_blank" rel="nofollow" href="http://tree.save" >tree.save</a>()** method which fires two request for each dirty node:

  1. A POST request to _<a target="_blank" rel="nofollow" href="http://example.org/restfulservice" >example.org/restfulservice</a>_ to create the new node.
  2. A PUT request to _<a target="_blank" rel="nofollow" href="http://example.org/restfultservice/parentId" >example.org/restfultservice/parentId</a>_ to update the children attribute at the parent node.

The widget works like a charm, but I found a problem when I try to add a child to a recently created node.


### An example.

Suppose we have a tree like this (_id:label_):

```
1:root
  6:one
    12:one.one
    15:one.two
      23:one.two.one
  9:two
```

You add a child to _12:one.one_ but you does not call the **tree.save()** method. Dojo assigns internally an auto-generated identifier to this node and the tree looks like this:

```
1:root
  6:one
    12:one.one
      fooID:one.one.one
    15:one.two
      23:one.two.one
  9:two
```

Now you add a child to this node:

```
1:root
  6:one
    12:one.one
       fooID:one.one.one
         barID:one.one.one.one
    15:one.two
       23:one.two.one
  9:two
```

Finally, you call **tree.save()** method and these requests are fired:

  1. A POST request to _http://example.org/restfulservice_ to save _one.one.one_ (Suppose the server creates it with 25 as identifier)
  2. A PUT request to _http://example.org/restfulservice/12_ to update _one.one_ children
  3. A POST request to _http://example.org/restfulservice_ to save _one.one.one.one_
  4. A PUT request to _http://example.org/restfulservice/fooID_ to update _one.one.one_ children

### The problem.

The problem is that when the fourth request is sent to the server, the node has not been updated by the result of the first one, so it does not have the identifier assigned by the server (_25_), but the assigned by dojo at the client side (_fooID_) which is not going to be recognized by the server, so **how can the server know which node to update?**

### The solution.

Well, the solution is very simple and you can find it at the [sitepen blog](http://www.sitepen.com/blog/2009/01/26/new-in-jsonreststore-13-dates-deleting-conflict-handling-and-more/):

> JsonRestStore 1.3 solves this problem borrowing a referencing technique from [RFC 2387 (multipart/related)](http://www.ietf.org/rfc/rfc2387.txt). When new items are created, the POST request will include a Content-ID header indicating a temporary id for the item. Other items being committed in the same transaction can then refer to the item by the `cid:` protocol with JSON referencing.

The server should save a temporary array which matches the temporary identifier assigned by dojo with the server one, so when a PUT request is sent to update a node, the server should look at this array for the client identifier and locate the real identifier of the node supposed to be updated.

I've checked that these requests are sent in synchronous mode, so the PUT request for a node is never sent before the POST request that creates it.

Simple, don't you think?
