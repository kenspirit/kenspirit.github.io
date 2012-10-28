---
comments: true
date: 2012-08-06 22:59:31
layout: post
slug: extjs-jasmine-maven-integration
title: ExtJS, Jasmine, Maven - Integration
wordpress_id: 317
categories:
- 技
tags:
- Jasmine
- Javascript
- Maven
- NodeJS
- UnitTest
---

After briefing [Why I am working on them](http://thinkingincrowd.me/2012/08/05/extjs-jasmine-maven-why-i-am-working-on-them/), let me show you how they can be integrated all together first.

[Jasmine](http://pivotal.github.com/jasmine/) is a BDD Test Framework which can be integrated in many environments.  At first, I want to integrate it with [NodeJS](http://nodejs.org/) which I have been eager to use for a long time.  However, when using NodeJS in Windows environment, I encountered some strange error "Class not found: File" if I tried to start my local Weblogic server.  After I removed NodeJS installation path from environment variable PATH, the error is gone.

The other reason I decided not integrating Jasmine in NodeJS in our project is because it might be difficult for some people to learn a completely new stuff and it is also not compatible to our JAVA development environment & process.  [Maven](maven.apache.org) is a better choice for us now because we should be using it for our project's build management.

Let's see how it can be done.  Here, I assume you already know what Maven is and have your own project POM.xml.  Then, simply setup [jasmine-maven-plugin](https://github.com/searls/jasmine-maven-plugin) in your POM.xml like below.

    
    <plugin>
        <groupId>com.github.searls</groupId>
        <artifactId>jasmine-maven-plugin</artifactId>
        <version>1.2.0.0</version>
        <extensions>true</extensions>
        <executions>
            <execution>
                <goals>
                  <goal>test</goal>
                </goals>
            </execution>
        </executions>
        <configuration>
    	<preloadSources>
    	    <source>${project.basedir}/[SOME_PRELOAD_FILES_GOES_HERE]</source>
    	</preloadSources>
    	<jsSrcDir>${project.basedir}/Resources/js</jsSrcDir>
    	<jsTestSrcDir>${project.basedir}/Resources/test/js</jsTestSrcDir>
    	<sourceIncludes>
                <include>[TO_BE_TESTED_JS_FILES_GOES_HERE]</include>
    	    <include>[TO_BE_TESTED_JS_FOLDER_GOES_HERE]/*.js</include>
    	</sourceIncludes>
    	<specIncludes>
    	    <include>[SPEC_JS_FOLDER_GOES_HERE]/*.js</include>
    	</specIncludes>
        </configuration>
    </plugin>


After you modify those CAPITALIZED PLACEHOLDER to fit your own project, you can simply type "mvn test" in command line to see whether Jasmine is included into your Maven test lifecycle.  You should have something similar in output:

    
    [INFO] Executing Jasmine Specs
    -------------------------------------------------------
     J A S M I N E   S P E C S
    -------------------------------------------------------
    [INFO]
    Test Suite Name 1
      Spec 1
      Spec 2
    
    Test Suite Name 2
      Spec 3
    
    Results: 3 specs, 0 failures


If you encounter any error, please go check the documentation site of this plugin or leave a comment here.  The plugin setup should be quite strange forward.

File path in _sourceIncludes_, _specIncludes_ are relative paths to _jsSrcDir_ and _jsTestSrcDir_.  _preloadSources_, _sourceIncludes_, _specIncludes_ are treated as ordered list so that you can properly arrange your JS and Jasmine Spec in correct order when your JS or Spec has some loading dependency.

OK, now preparation for Unit Test is done.  Let's see how Jasmine can be used to do Unit Test especially for ExtJS project together in my next post.
