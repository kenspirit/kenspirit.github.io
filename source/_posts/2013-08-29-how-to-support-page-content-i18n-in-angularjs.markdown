---
layout: post
title: "How to support page content i18n in AngularJS"
date: 2013-08-29 20:16
comments: true
categories: 
- Sword
tags:
- Javascript
- AngularJS
- SPA
---

[i18n]: http://code.angularjs.org/1.0.8/docs/guide/i18n  
[SPA]: http://en.wikipedia.org/wiki/Single-page_application  
[AngularJS]: http://angularjs.org  
[$rootScope]: http://code.angularjs.org/1.0.8/docs/api/ng.$rootScope  
[$interpolate]: http://code.angularjs.org/1.0.8/docs/api/ng.$interpolate  
[$filter]: http://docs.angularjs.org/api/ng.$filter  

[i18n][] (Internationalization) is one of the development guide section in AngularJS.  However, the doc doesn't really help us a lot to do what we want basically for i18n, language change support of the web page content.  

As an [SPA][] (Single Page Application), the view in [AngularJS][] is partially loaded, rendered and even cached at client side.  When user switches the language, how can we rerender the page with another language?  

My idea is to make the label or web page content as a binding model linked with the language.  If the language value is changed when users switch language, those label models should be updated.  It works smoothly but I haven't done performance test for extremely large page yet.  

Let's see how it's done.  

First, I need to define a Service which is used to fetch language resource file, cache them locally, and do the translation.  

```javascript
    factory('LocaleManager', function($resource, $rootScope) {
        var langs = {},
            LocaleManager = $resource('/js/i18n/resources-locale_:lang.js',
                {port: ':3000', lang: 'en_US'});

        LocaleManager.load = function(language) {
            if (langs[language]) {
                if ($rootScope.language !== language) {
                    $rootScope.language = language;
                }
                return;
            }

            return LocaleManager.get({lang: language}, function(data) {
                langs[language] = data;
                $rootScope.language = language;
            });
        };

        LocaleManager.getText = function(text, language) {
            if (language === 'en_US') {
                return text;
            }
            if (langs[language] && langs[language][text]) {
                return langs[language][text];
            }
            return text;
        };

        return LocaleManager;
    })
```

You can find that there is a [$rootScope][] level variable _language_  which is set to the user selected language when _LocaleManager.load_ is called.  

Later if we use the [$interpolate][] like below in the view, the text value can be updated whenever the _$rootScope.language_ is changed.  

{% raw %}
    {{ LocaleManager.getText('Login', language) }}
{% endraw %}

An alternative approach is to define a [$filter][] for translation instead of calling a method from Service class.  Haven't tried that yet and will give an update here once done.

Do you have experience on i18n in AngularJS?  Thoughts and comments are appreciated.
