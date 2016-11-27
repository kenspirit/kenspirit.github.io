---
comments: true
date: 2012-07-21 9:19:57
layout: post
slug: i18n-extjs-and-jawr
title: i18n, ExtJS and JAWR
wordpress_id: 225
categories:
- Sword
tags:
- ExtJS
- i18n
- Javascript
- JAWR
---

**What is i18n and How to do it in Javascript?**

i18n, which is so called internationalization, is to support multilingual for a platform.

ExtJS, JavaScript framework, provides numerous UI  components to build complex UI.

In order to implement i18 in UI page purely built by ExtJS, it's inevitable to translate the title, label of the ExtJS components into proper language.  From my point of view, there should be two ways for that:




  1. Use the translated text directly in the UI components during construction


  2. Use separate JS to replace the text before rendering, say in initComponent method or beforeRender event handler.


There are pros and cons for each approach:


  1. Approach #1 is easy, but injecting logic for i18n text translation into the UI components construction is just like adding event handler into the HTML directly and it makes the code for text translation spread all around the code building UI.


  2. Approach #2 separates the i18n implementation detail which makes it easier to change.  The benefit got from this can be easier prototyping, unit testing, and future enhancement if i18n implementation changed.


In order to avoid violation of separation of concern principle, I would like to choose approach #2.  If you agree with me, you can keep going.

**How to use JAWR to implement i18n**

Normally, i18n text file is built with property file (e.g. msg_en_UI.properties) in which an entry is represented as:
```ini
    msgkey=msgText in i18n
```
This kind of file is very common in JAVA and [JAWR](http://jawr.java.net) can be used to interpret this kind of property file and built code for i18n.  It's quite easy to setup JAWR and I am not going to brief it here.  In a word, if your i18n text entry built like this:


```ini
    main.hello.world=Hello world!
```



Then you can get the translated text by:



```javascript
    messages.main.hello.world(); // Hello world!
```


Actually, JAWR build the text to Javascript data structure (messages is default prefix) to make a function call to get the actual text (i18n is based on which property file loaded depending on your locale resolver).

OK, till now, do you get the idea and like this kind of implementation?

Personally, I don't quite like it.  Although the usage of data structure is to prevent polluting the Javascript namespace, directly mapping to data structure with the message key makes it hard to dynamically handle the text translation or even in batch operation.  Imagine the message key is the ID of the UI component, you have to use eval() function on "ID of UI component + ()" if you want a generic way.

Hence, I would rather have a Message Manager class having a function to return the translated message by passing in the message key.  If you agree with me again, keep follow.

Luckily, I am able to do this because JAWR provides flexibility to use a customized message generator.  Let's see how to do it.  According to its doc about [message](http://jawr.java.net/docs/messages_gen.html) and [generators](http://jawr.java.net/docs/generators.html), we need just need to do three things:




  1. Set below sample lines in jawr.properties file:

```ini
    jawr.custom.generators=xxx.MyResourceBundleMessagesGenerator

    jawr.js.bundle.lib.mappings=**mymessages**:com.myapp.messages(mynamespace)
```




  2. Build the customized generator.  How? The simplest way is to extends the _net.jawr.web.resource.bundle.locale.ResourceBundleMessagesGenerator_ and overrides its _public Reader createResource(GeneratorContext context)_ to use our own generator and overrides its _public String getMappingPrefix()_ to return our own mapping **mymessages**.


  3. Build the customized creator.  How?  The simplest way is to extends the _net.jawr.web.resource.bundle.locale.message.MessageBundleScriptCreator_ and overrides its _protected Reader doCreateScript(Properties props)_ to write our own script generation code.


Below is the sample code in my _xxx.MyResourceBundleMessagesGenerator_:


```java
    @Override
    public Reader createResource(GeneratorContext context) {
      MyMessageBundleScriptCreator creator = new MyMessageBundleScriptCreator(context);
      return creator.createScript(context.getCharset());
    }

    @Override
    public String getMappingPrefix() {
      return "mymessages";
    }
```


Below is the sample code in my _xxx.MyMessageBundleScriptCreator_:


```java
    private StringBuffer loadScriptTemplate() {
      StringWriter sw = new StringWriter();
      InputStream is = null;
      try {
        is = ClassLoaderResourceUtils.getResourceAsStream("/xxx/messages.js", this);
        IOUtils.copy(is, sw);
      } catch (IOException e) {
        throw new BundlingProcessException("Fail to load the message template. ", e);
      } finally {
        IOUtils.close(is);
      }
      return sw.getBuffer();
    }

    @Override
    protected Reader doCreateScript(Properties props) {
      String script = loadScriptTemplate().toString();
      Set keys = props.stringPropertyNames();
      StringBuffer messages = new StringBuffer("{");
      for (String key : keys) {
        String value = props.getProperty(key);
        messages.append(
    "\"" + key + "\": \"" + StringUtils.defaultString(value, "").replaceAll("\"", "\\\\\"") + "\",\n");
      }
      if (messages.length() > 1) {
        messages.deleteCharAt(messages.length() - 1);
      }
      messages.append("}");
      script = script.replace("@namespace", RegexUtil.adaptReplacementToMatcher(this.namespace));
      script = script.replaceFirst("@messages", RegexUtil.adaptReplacementToMatcher(messages.toString()));
      return new StringReader(script);
    }
```


Finally, let's see what is in my message.js:


```javascript
    if (!window.MultilingualMessageMgr) {
      window.MultilingualMessageMgr = (function(){
        var msgMap = {};
        return {
          getMsg: function(namespace, msgKey) {
            var argLen = arguments.length;
            if (argLen < 2) {
              return null;
            }
            var msg = null;
            if (argLen === 2) {
              msg = msgMap[namespace][msgKey];
            }
            if (argLen > 2) {
              for (var i = 2; i < argLen; i++) {
                msg = msg.replace("{" + (i - 2) + "}", arguments[i]);
              }
            }
            return msg;
          },
          putMsgs: function(namespace, msgObj) {
            msgMap[namespace] = msgObj;
          }
        };
      })();
    }
    window.MultilingualMessageMgr.putMsgs("@namespace", @messages);
```



Let me explain a bit on what the _MultilingualMessageMgr_ does here.

It's an object which is returned by anonymous function.  This object has a _getMsg_ and _putMsgs_ function.  Both of them is referring to an _msgMap_ object in the anonymous function scope so that it cannot be accessed directly outside _MultilingualMessageMgr_.  The _getMsg_ function takes at least two arguments including namespace and message key, any other parameters are treated some value to replace the placeholder in message.  The _getMsg_ function puts the messages json object with namespace bound to it for retrieval later.

With this _MultilingualMessageMgr,_ multilingual message translation can be done by sample call like:

```javascript
    MultilingualMessageMgr.getMsg(namespace, msgKey);
```

Now, centralizing i18n logic to dynamically replace all ExtJs UI components can be realized by building the property file with component id as message key and iterating all components to replace them.

If you have any comment or better idea on how to do i18n in JavaScript, please let me know.
