# Coze Wechat

## 概述

Coze Wechat将coze.cn智能体接入Wechat

- 支持多轮对话
- 支持回复图片
- 支持设置群白名单
- 封装coze bot API

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

运行以下指令启动机器人

```shell
npm run start
```

首次启动会要求扫码登录，使用手机微信扫码即可

> 注意注意注意：本项目为个人学习项目，请勿用于任何商业用途；建议使用小号登录，以免因封控带来不便

## 机器人切换

底层机器人基于wechaty实现，可以通过切换wechaty-puppet更换底层机器人,例如使用wechaty-puppet-xp

```
npm i wechaty-puppet-xp@1.13.12
```

## 体验群

<img src="./docs/images/room.jpg" alt="room" width="300">
