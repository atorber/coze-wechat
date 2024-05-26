# Coze Wechat

## 概述

Coze Wechat将coze.cn智能体接入Wechat

- 支持多轮对话
- 支持回复图片
- 只是设置白名单

## 快速入门

### 安装依赖

```shell
npm i 
```

### 配置环境变量

在根目录创建一个名称为.env的配置文件

```yaml
WECHATY_PUPPET=wechaty-puppet-wechat4u # wechaty puppet
WECHATY_TOKEN='' # wechaty token

COZE_ENDPOINT=https://api.coze.cn/open_api/v2/chat
COZE_TOKEN='coze的API token'
BOT_ID='coze的bot id'
```

### 启动机器人

首先启动一个wechaty客户端（目前仅支持nodejs），并使用mqtt-wechaty插件
机器人可以运行在本地或云服务器中，只需要可以访问外网，不需要配置外网IP

```shell
npm run start
```
