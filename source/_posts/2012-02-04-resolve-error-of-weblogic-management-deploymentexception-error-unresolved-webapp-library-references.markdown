---
comments: true
date: 2012-02-04 09:07:35
layout: post
slug: resolve-error-of-weblogic-management-deploymentexception-error-unresolved-webapp-library-references
title: 'Resolve Error of "weblogic.management.DeploymentException: Error: Unresolved
  Webapp Library references"'
wordpress_id: 198
categories:
- 技
tags:
- Weblogic
---

When I tried to deploy an EAR to weblogic these days, I encountered one problem if deploying it to a newly created server, but not the default ADMIN one.

> weblogic.management.DeploymentException: Error: Unresolved Webapp Library references for "ServletContext@36720652[app:WLS_PRS_DOC module:wls_prs_doc p
ath:/wls_prs_doc spec-version:2.5]", defined in weblogic.xml [Extension-Name: jsf, Specification-Version: 2, exact-match: true], [Extension-Name: jstl
, Specification-Version: 1.2, exact-match: true]

It looks strange from the error message that the EAR is referring to some jars but cannot be resolved.

I remember that these two jars have been set as shared library in Weblogic since the very beginning and why the problems occur when I am deploying it to the newly created server but not ADMIN.

I wonder around by using Google and happened to see this website.

[http://middlewaremagic.com/weblogic/?p=2938](http://middlewaremagic.com/weblogic/?p=2938)

It's also said that the directory having the Shared Library should be included when you are calling weblogic.appc to compile your EAR.

I immediately realized that those two shared library might not been included in the server I newly created.  Hence, I set them up in the shared library.  And the problems solved.

[![Image](https://dl.dropbox.com/u/17182499/blog/2012/02/1.jpg?w=574)](https://dl.dropbox.com/u/17182499/blog/2012/02/1.jpg)[![Image](https://dl.dropbox.com/u/17182499/blog/2012/02/2.jpg?w=614)](https://dl.dropbox.com/u/17182499/blog/2012/02/1.jpg)

 

 
