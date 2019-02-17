title: Modulization and Bundling with TypeScript and Webpack for JavaScript Full Stack Project
date: 2016-01-02 16:09:39
tags:
  - Javascript
  - TypeScript
  - Bundling
  - Modularization
categories:
  - Sword
---

## Modulization

In a Full Stack JS project, the essence is how to write code consistently and easy to share and maintain because code sharing between server and browser is unavoidably.  Before talking about what strategy we are taking, let's have a review on the trend of the modulization first.

### Ancient history

There is no such thing and all things are global.  This causes potentially naming conflict and it's not good for maintenance.

```javascript
var logo = 'KanbanizeIT';

function sayHello(name) {
  alert(logo + ' wish you a happy new year, ' + name);
}
```

### Package/Namespace Concept

Some well-known library, like ExtJS, takes package/namespace concept and they manage the source in this structure.

```javascript
Ext.ns('com.kanbanizeit');

Ext.apply(com.kanbanizeit.SubModule, {
  oneThousand: 1024,
  oneThousandInComputer: function() {
    return oneThousand;
  }
});
```

### Immediately-Invoked-Function-Expression (IIFE)

This approach reduce the hassle of long namespace and groups all internal stuffs encapsulated.  Many small library adopts this style, e.g. jQuery.  

```javascript
var kanbanizeIT = (function() {
  var privateField = 1024;

  return {
    publicStuff: function() {
      return privateField;
    }
  };
})();
```

### CommonJS/Node.js

This style went popular due to the popularity of Node.js.  Each file is a module and all variables defined within that file are only visible in that file.  If you have public API want to publish, you need to export it.

```javascript
// logo.js
module.exports = 'KanbanizeIT';

// sayHello.js
var logo = require('./logo');

module.exports = {
  sayHello: function() {
    return 'Welcome to join ' + logo;
  }
};
```

### AMD/CMD

CommonJS is suited for server-side JS loading because it's synchronous file loading in Node.js.  But for browser, script loading is asynchronous and so other groups of people propose different styles target for browser-side JS loading.

[RequireJS]: http://www.requirejs.org/

[RequireJS][] is the representative for AMD style.

```javascript
define(['a', 'b', function(a, b) {
  a.doSomething();

  b.doAnotherThing();
}]);
```

[sea.js]: http://seajs.org/docs/en.html

[sea.js][] is the representative for CMD style.

```javascript
define(function(require, exports, module)) {
  var a = require('a');
  a.doSomething();

  var b = require('b');
  b.doAnotherThing();
}
```

### ES6

The latest ECMAScript 6 standard has below syntax.  However, this is not supported in most of the JS execution environment yet.

```javascript
// xxx.js
export default xxx;

// yyy.js
import xxx from './xxx';
```

### My strategy

[TypeScript vs Babel]: http://www.thinkingincrowd.me/2015/12/26/TypeScript-vs-Babel/

[Share code between Node.js and browser]: http://www.thinkingincrowd.me/2013/04/13/share-code-between-nodejs-and-browser/
[browserify]: https://github.com/substack/node-browserify

About 2 years ago, I wrote an article "[Share code between Node.js and browser][]" about this topic already.  At that time, I explain why I decided to choose to write the code in Node.js style and then use tools like [browserify][] (Now we has Webpack too) to do the bundling for browser.  I still consider my choice is the right way to go.  

Now I just changed to **write all JavaScript in ES6 format no matter for browser-side or server-side**, then do the bundling for browser.  This choice enables me to have consistent coding style regardless which environment it's targeted to.  One more reason for me to abandon the hassle introduced from AMD or CMD is that when the HTTP2 era comes, I have no need to do the bundling anymore and just have to skip this step without changing any code.

But browser doesn't support ES6 syntax now.  No worry, you should use a transpiler.  Checkout my article [TypeScript vs Babel][] if you know nothing about it.

## Bundling

[Single Source of Truth]: https://en.wikipedia.org/wiki/Single_Source_of_Truth
[JAWR]: https://jawr.java.net/

To me, **The No. 1 principle of bundling is [Single Source of Truth][]**.

How is that?  Normally, we need to have some configuration to define a bundle name and file selectors to decide what files to be included in the bundle, like the [JAWR][] used in my company.  It is really ugly and error-prone.

Now, if we make use of the modulization and control the dependency through ES6 `import` and `export`, then we can base on this relationship to control the bundling as well.  What we need to do is to specify a bootstrap JS file as entry point and let the tools to figure out all dependencies to be included.  No other configuration should be needed unless special requirement is raised, such as bundle splitting for lazy load, etc.  

Hence, **the dependency specified in the source code itself should be the only single truth**.  

### TypeScript config & folder structure

Sample `tsconfig.json` setting is as below which compiles all TypeScript source to be compatible with ES5 standard and use CommonJS style for module usage.  Folder structure is simply separated to `common`, `client` and `server` for illustrating purpose.  You can further arrange based on your preference.  

The compiled source is output to `build` directory and retains the original folder structure.

<img alt="Source Folder Structure" src="https://raw.githubusercontent.com/kenspirit/blog-cdn-data/master/js_typescript_folder_structure.png" style="position: relative; float: right; margin-left: 5px; border: 0px; padding: 0px;"/>

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "outDir": "build"
  },
  "exclude": [
    "node_modules",
    "dist",
    "build"
  ]
}
```

### Webpack integration

When integrating Webpack with TypeScript support, we need to use `ts-loader` to compile the `.ts` file.  Sample `webpack.config.js` is as below when I am testing to bundle the client-side JavaScript for browser usage:

```javascript
var webpack = require('webpack'),
    path = require('path');

module.exports = {
    context: __dirname + '/src',
    entry: {
      index: './client/index'
    },
    output: {
        path: __dirname + '/dist',
        publicPath: '/',
        filename: '[name].bundle.js'
    },
    resolve: {
      root: __dirname,
      extensions: ['', '.ts', '.js']
    },
    module: {
      loaders: [
        { test: /\.ts$/, loaders: ['ts-loader'], exclude: /node_modules/ }
      ]
    }
}
```

There are two issues discovered after the testing:

* Any compile warning can possibly block the webpack build process.  To fix this, we can add a `ts` config in webpack and ignore some particular errors.  

![TypeScript Warning](https://raw.githubusercontent.com/kenspirit/blog-cdn-data/master/js_typescript_error.png)

```javascript
module.exports = {
  ts: {
    ignoreDiagnostics: [2339]
  }
}
```

[typescript-require]: https://github.com/theblacksmith/typescript-require

* Normally, we only need to bundle the code for browser, so the webpack `entry` only specify entries for client-side script.  Even though the `ts-loader` still use the `tsconfig.json` to compile all TypeScript, the compiled TypeScript is not output to the `outDir` specified in `tsconfig.json` and so the server-side TypeScript is not compiled to JavaScript.  Then how can Node.js use the TypeScript then?  

There is one approach to use [typescript-require][] extension and put `require(‘typescript-require’);` to the bootstrap entry js executed by Node.js, `.ts` module can be loaded just like the `.js` module.

However, I don't want to go with it because it introduces some exception (Entry `.js` file for Node.js and this special extension).  I still want all TypeScript source be compiled out to a build folder with exact folder structure.

### Gulp Integration

I have to bring in Gulp to control the process instead.  First compiles all TypeScript and then calls Webpack to do the bundling by pointing to the `build` folder instead of original `src` folder.  Hence, `ts-loader` in `webpack.config.js` is not necessary anymore.

`gulpfile.js`

```javascript
require('./gulp');
```

`index.js` under gulp folder.

```javascript
'use strict';

var gulp = require('gulp');

require('./typescript');
require('./webpack');

gulp.task('default', ['typescript', 'webpack']);
```

`typescript.js` under gulp folder.

```javascript
'use strict'

var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsconfig = require(process.cwd() + '/tsconfig.json');
var tsProject = ts.createProject('tsconfig.json');

gulp.task('typescript', function() {
  var tsResult = tsProject.src() // instead of gulp.src(...) 
    .pipe(ts(tsProject));
  
  return tsResult.js.pipe(gulp.dest(tsconfig.compilerOptions.outDir));
});
```

`webpack.js` under gulp folder.  To be aware that the `webpack` task has defined a dependency on `typescript` task so that it will waits under the `typescript` task to complete before it starts.

```javascript
'use strict'

var gulp = require('gulp');
var gutil = require('gulp-util');
var webpack = require('webpack');
var webpackConfig = require(process.cwd() + '/webpack.config');

gulp.task('webpack', ['typescript'], function(callback) {
    // run webpack
    webpack(webpackConfig, function(err, stats) {
        if(err) throw new gutil.PluginError('webpack', err);
        gutil.log('[webpack]', stats.toString({
            // output options
        }));
        callback();
    });
});
```

The execution is as below.

![Gulp and Webpack](https://raw.githubusercontent.com/kenspirit/blog-cdn-data/master/js_webpack_gulp.png)

Till now, you should have basic idea on how to work with TypeScript and Webpack for JavaScript full stack project.  But there is one more thing, how about CSS?  Can it be the same?

### CSS dependency

For example, my app uses AngularJS and Bootstrap and I want to include them all like below.

```javascript
// <reference path="typings/angularjs/angular.d.ts" />
// <reference path="typings/angularjs/angular-route.d.ts" />

import 'angular';
import 'angular-route';
import 'angular-ui-bootstrap';
import 'bootstrap.css';
```

How can I setup the Webpack and bundle all dependencies?  Here is the complete `webpack.config.js`.

```javascript
var webpack = require('webpack'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    path = require('path');

module.exports = {
    context: __dirname + '/build/src',
    entry: {
      index: './client/index'
    },
    output: {
        path: __dirname + '/dist',
        publicPath: '/',
        filename: '[name].bundle.js'
    },
    resolve: {
      alias: {
        'bootstrap.css': path.join(__dirname, '/node_modules/bootstrap/dist/css/bootstrap.min.css')
      },
      root: __dirname,
      extensions: ['', '.css', '.js']
    },
    module: {
      loaders: [
        {
            test: /\.(eot|woff|woff2|ttf|svg|png|jpg)$/,
            loader: require.resolve("url-loader") + '?name=[name]-[hash].[ext]'
        }
        , { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: true,
        template: './src/client/index.html',
        chunks: ['index']
      })
      , new ExtractTextPlugin('[name].css', {
        allChunks: true
      })
    ]
}
```

There are couples of setting took me a while to figure out.

1. `alias` for `bootstrap.css` is necessary so that it can be correctly resolved.  

2. Without the `require.resolve("url-loader")`, when parsing the CSS file, it complaints `Cannot resolve module 'url-loader'`.  

3. `ExtractTextPlugin` is used to output the CSS as a separated file instead of being embedded in the bundled JS and dynamically generated as a `<style>` tag in HTML file during page load.

4. `HtmlWebpackPlugin` is used to automatically inject the generated CSS and JS files into the appropriate location in the entry HTML file as below.

![Final HTML result](https://raw.githubusercontent.com/kenspirit/blog-cdn-data/master/js_webpack_gulp_final_result.png)

I haven't talked about how to include internal CSS or HTML yet.  However, I think you can figure out yourself based on the sample and strategy described here.  
