# YIcon Builder

如果希望在自己的服务器上搭建字体站，可以遵照如下的方式，一步一步进行部署即可。

## 环境要求

环境要求：

- node 4.x+
- npm 3.x
- mysql 5.5+

npm 应该升级到 3.x，升级方式为：

```
$ sudo npm install -g npm@3 --registry=https://registry.npm.taobao.org
```

应该提前配置好 mysql 的服务，创建一个用户及其登录密码（可参考[这篇文章](http://www.cyberciti.biz/faq/mysql-change-root-password/)），并在里面创建一个 `utf-8` 编码的数据库。数据库名字、用户名、密码应和下面配置项中的名字保持一致。

## 初始安装

使用离线安装的方式，找到我们的压缩包 `yicon-builder.tar.gz`，运行命令：

```bash
$ npm install yicon-builder -g
```

安装完成之后，会在拥有一个 `yicon` 的命令。运行 `yicon init`，可以按照提示进行安装：

### 提示：输入安装路径

这个是项目的安装路径，安装时会生成如下的目录结构：

```
├── config.json
├── logs
└── src
```

### 提示：输入数据库配置项

这里是连接数据库的必备选项，包含以下内容：

1. 数据库域名，即数据库服务的域，如果配置在本地就填写默认 `127.0.0.1`；
2. 数据库用户名，即登录数据库的默认用户，默认为 `root`；
3. 数据库密码，必须按照上文所述，给数据库设定一个密码，默认为 `123456`；
4. 数据库端口号，默认 `3306`；
5. 数据库名称，必须在设置之前创建并指定一个特定的数据库，推荐为默认值 `iconfont`；

配置完成后将生成配置文件，并尝试连接数据库，如果连接期间存在问题，将无法自动导入数据表，安装程序会将创建数据表的 sql 文件置入安装路径中，需要稍后手动导入。

### 提示：选择登陆类型

由于本应用没有接入第三方登录，因此依赖内部系统的 cas 或 sso 登录模式。应用内部已经支持这两种模式的配置，只需要提供相关 url 即可。

在生成的配置文件中，我们会看到如下配置：

```javascript
{
    "login": {
        "ssoType": "cas",
        "authUrl": "http://cas.example.com/cas/login?service={{service}}",
        "tokenUrl": "http://cas.example.com/serviceValidate?service={{service}}&ticket={{token}}",
        "serviceUrl": "http://app.iconfont.com",
        "adminList": []
    }
}
```

这里面的配置项含义如下：

- `ssoType`: 根据用户输入自动生成登录类型，会分别按照 cas 和 sso 的规则进行登录；
- `authUrl`: 指点击登录按钮时需要跳转的 url，通常是一个登录页面，用户在这个页面登录后，会给服务端返回一个 token；
- `tokenUrl`: 服务端在获取 token 之后，可以通过这个 url 来获取用户的详细信息；
- `serviceUrl`: 通常这两种服务都需要提供当前域名，这里可以配置 iconfont 字体站服务的域名；
- `adminList`: 字符串格式的数组，里面可以写入超管的用户名，用于配置超管，如 `['minghao.yu']`。

url 中的 `{{xxx}}` 格式表示占位符，其中 `{{service}}` 会被替换成 `serviceUrl`，`{{token}}` 会被替换成获取的 token。

## 依赖安装

初始安装成功后，会提示需要进入到安装路径的 src 路径下执行 `npm install` 进行依赖安装，目前只提供淘宝源，如果有自己指定的源，可以选择 `3) other`，然后手动输入源（如输入 `http://registry.npm.xxx.org`）。

## 项目编译

安装依赖完成之后，会在 `/src` 目录下执行 `npm run build` 进行静态资源编译；如果编译出错，可以去项目路径中手动执行 `npm run build` 编译。

## 项目启动

依赖安装完成后，进入到安装路径的 src 路径下执行 `./start.sh` 进行项目启动，或者自行选择使用 pm2 等工具进行启动。

## 项目更新

在项目目录下运行

```
$ yicon update
```

运行完成之后，会先分析当前项目的变动，可以手工先保存变动的文件。之后项目会拉取最新的代码，覆盖项目内部的 `/src` 目录，并重新安装依赖和编译。

**Tips**

- 更换 Logo，请替换 `src/static/images/qiconbg.png`。
