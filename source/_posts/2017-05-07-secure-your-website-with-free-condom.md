title: 为你的网站带上免费的安全套
date: 2017-05-07 11:47:41
tags:
  - Security
  - HTTPS
  - Nginx
categories:
  - Sword
---

我承认我标题党了一下，不过看在为你们介绍好东西的前提下，就原谅我一次吧。  

## 为什么

无论是现实生活你要ＯＯＸＸ，还是要在虚拟世界里游历，安全都是最重要的。生活有 Durex 或者冈本，而在虚拟世界里，HTTPS 正是可以为我们的网站提供保护的套套。  

况且，最近我在玩微信小程序，而它要求服务器必须支持 HTTPS（可见企鹅的安全感多强）。所以在我的域名申请下来和备案通过后，我要为我的服务器准备 HTTPS 的证书和服务了。  

## 怎么选

[Let's Encrypt]: https://letsencrypt.org/

HTTPS 的证书和服务说实在挺贵的。在腾讯云下面无论是购买 Symantec, GeoTrust 或 TrustAsia 的多域名证书，一年下来都要 5000 元左右。免费的 SSL 证书服务有好一些，如 Let's Encrypt，StartSSL、Wosign沃通。腾讯云也有和 GeoTrust SSL 合作，提供一年的免费证书。  

那怎么选？  

首先，StartSSL、Wosign沃通作大死，很多浏览器厂商已经取消对它们新颁发的证书的信任。  

腾讯云的免费证书，一年后怎么办？听起来还是不够稳妥。  

[Let's Encrypt][] 作为 Linux 基金会下的合作项目，它得到许多著名大厂，如 Mozilla, Chrome, Facebook, Cisco 等支持。虽然证书只有 90 天有效期，但是它的安装和设置做的相当容易，还能自动化续期，相当于就永久免费了。  

聪明如你，当然知道怎么选择啦。我肯定选择免费又好用的 [Let's Encrypt][]了。  

## 带套套的步骤

接下来我就大致介绍一下怎么方便舒适地带上这个套套。  

[Certbot]: https://certbot.eff.org/#ubuntutyakkety-nginx

下面假定你有自己的服务器，和 Shell 访问的权限。Let's Encrypt 其实提供了一个非常方便的自动化工具，由 EFF 提供的 [Certbot][]。  

大家通过上面的网站就能看到它为不同的系统，不同的网络服务器提供的安装指南。下面以在腾讯云下，Nginx 和 Ubuntu 16.10 的环境，使用 Webroot 认证方式，并且要认证的域名是 `funnyken.com` 来举例。同时假定你有一定的 Linux 和 Nginx 基础。  

### 安装 certbot  

```
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install certbot 
```

### 配置目录和权限

在使用工具自动化获取证书，配置之前，先为你要认证的网站新建一些目录，和做权限设置。如果你是以 `root` 的身份来运行你的服务的话，`sudo chown` 那些命令不是必须的。但是腾讯云下面的服务器默认登录和使用都是用 ubuntu 的帐号，所以还是要修改一下。  

```
sudo chown ubuntu:ubuntu -R /etc/letsencrypt/
sudo chown ubuntu:ubuntu -R /var/lib/letsencrypt/
sudo chown ubuntu:ubuntu -R /var/log/letsencrypt/

sudo mkdir -p /var/www/funnyken/
sudo chown ubuntu:ubuntu -R /var/www/funnyken/
mkdir -p /var/www/funnyken/.well-known/acme-challenge/
```

### 获取证书

在下面的命令后面，你可以添加更多的 `-d xxx.funnyken.com` 来为你的其它子域名认证。  

```
certbot certonly --webroot -w /var/www/funnyken -d funnyken.com -d www.funnyken.com
```

命令运行完后，会有如下类似的提示：  

>IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at
   /etc/letsencrypt/live/funnyken.com/fullchain.pem. Your cert
   will expire on 2017-08-01. To obtain a new or tweaked version of
   this certificate in the future, simply run certbot again. To
   non-interactively renew *all* of your certificates, run "certbot
   renew"
 - If you lose your account credentials, you can recover through
   e-mails sent to sammy@example.com.
 - Your account credentials have been saved in your Certbot
   configuration directory at /etc/letsencrypt. You should make a
   secure backup of this folder now. This configuration directory will
   also contain certificates and private keys obtained by Certbot so
   making regular backups of this folder is ideal.
 - If you like Certbot, please consider supporting our work by:

>   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
>   Donating to EFF:                    https://eff.org/donate-le

### 配置 Nginx

在你的 Nginx 安装目录下，新建一个文件夹 `snippets`。

```
sudo mkdir /etc/nginx/snippets
```

分别创建下面两个文件：

`letsencrypt.conf`

```
  location ^~ /.well-known/acme-challenge/ {
      default_type "text/plain";
      root /var/www/funnyken;
  }
```

`ssl.conf`

```
  ssl_session_timeout 1d;
  ssl_session_cache shared:SSL:50m;
  ssl_session_tickets off;

  ssl_protocols TLSv1.2;
  ssl_ciphers EECDH+AESGCM:EECDH+AES;
  ssl_ecdh_curve secp384r1;
  ssl_prefer_server_ciphers on;

  ssl_stapling on;
  ssl_stapling_verify on;

  add_header Strict-Transport-Security "max-age=15768000; includeSubdomains; preload";
  add_header X-Frame-Options DENY;
  add_header X-Content-Type-Options nosniff;
```

在你的 Nginx 服务器配置里面，在 `server` 内添加类似的设置：  

```
  server {
    listen 80;
    listen [::]:80;
    listen 443 ssl http2 default_server;
    listen [::]:443 ssl http2 default_server;

    server_name www.funnyken.com funnyken.com;

    include /etc/nginx/snippets/letsencrypt.conf;

    ssl_certificate /etc/letsencrypt/live/funnyken.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/funnyken.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/funnyken.com/fullchain.pem;

    include /etc/nginx/snippets/ssl.conf;
  }
```

然后重启你的 Nginx 或者重新加载配置文件就大功告成了。  

### 测试套套是否稳妥

经过以上步骤，套套应该佩戴上了。不过还是要简单测试一下的。在浏览器里输入以下的地址，替换你的域名就可以了。  

>https://www.ssllabs.com/ssltest/analyze.html?d=funnyken.com

### 配置自动更新

虽然可能经测试，目前带上的套套应该是安全可靠的。但是，正如前面所说，它只有 90 天有效期。所以还是要定期更换。我们在 Ubuntu 下面简单配置一个 Cron Job 就好了。  

```
sudo crontab -e
```

添加如下一行，让服务器每天凌晨 2 点检查一下证书，并在需要的情况下重启 Nginx 就可以了。  

```
0 2 * * * /usr/bin/certbot renew --quiet --renew-hook "/bin/systemctl reload nginx"
```

### 参考文章

[How to setup Let's Encrypt for Nginx on Ubuntu 16.04 (including IPv6, HTTP/2 and A+ SLL rating)](https://gist.github.com/cecilemuller/a26737699a7e70a7093d4dc115915de8)

[How To Secure Nginx with Let's Encrypt on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04)
