#!/usr/bin/env -S node --no-warnings --loader ts-node/esm
/* eslint-disable camelcase */
/* eslint-disable sort-keys */
import 'dotenv/config.js'
import { Contact, Message, ScanStatus, WechatyBuilder, log } from 'wechaty'
import { FileBox } from 'file-box'
import { PuppetBridgeJwpingWxbotV3090825 as PuppetBridge } from 'wechaty-puppet-bridge'
import qrcodeTerminal from 'qrcode-terminal'
import { CozeBot, ChatV2Req } from './coze.js'

const token = process.env['WECHATY_TOKEN']
const puppet = process.env['WECHATY_PUPPET']
let currentUser: Contact | null = null

const whiteList = [ '插画诗', '吟诗一首' ]
const needAt = process.env['NEED_AT'] === 'true' || false
const coze_token = process.env['COZE_TOKEN'] || ''
const bot_id = process.env['BOT_ID'] || ''
const cozeBot = new CozeBot({
  api_key: coze_token,
  bot_id,
})
let isCozeCreating = false

function onScan (qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    const qrcodeImageUrl = [
      'https://wechaty.js.org/qrcode/',
      encodeURIComponent(qrcode),
    ].join('')
    log.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)

    qrcodeTerminal.generate(qrcode, { small: true })  // show qrcode on console

  } else {
    log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status)
  }
}

function onLogin (user: Contact) {
  log.info('StarterBot', '%s login', user)
  if (process.env['WECHATY_PUPPET'] && [ 'wechaty-puppet-wechat', 'wechaty-puppet-wechat4u', 'wechaty-puppet-xp' ].includes(process.env['WECHATY_PUPPET'])) {
    currentUser = user
  }
  console.info('onLogin:', currentUser)
}

function onReady () {
  if (process.env['WECHATY_PUPPET'] && [ 'wechaty-puppet-service' ].includes(process.env['WECHATY_PUPPET'])) {
    currentUser = bot.currentUser
  }
  console.info('onReady:', currentUser)
}

function onLogout (user: Contact) {
  log.info('StarterBot', '%s logout', user)
}

async function onMessage (msg: Message) {
  log.info('onMessage', JSON.stringify(msg))
  const talker = msg.talker()
  const room = msg.room()
  const topic = await room?.topic()
  const text = msg.text()

  log.info('talker:', JSON.stringify(talker))

  if (room && topic && whiteList.includes(topic) && (!needAt || await msg.mentionSelf())) {
    if (isCozeCreating) {
      await room.say('当前有任务正在运行，请等待完成后继续对话~', ...[ talker ])
    } else {
      const data: ChatV2Req = {
        conversation_id: room.id,
        user: topic,
        query: text,
        history_count: 5,
        stream: false,
      }
      try {
        isCozeCreating = true
        const chatResp = await cozeBot.chat(data)
        const urls = chatResp.extractImageUrls()
        const answers = chatResp.extractAnswer()
        if (urls.length > 0) {
          for (const url of urls) {
            const fileBox = FileBox.fromUrl(url)
            await room.say(fileBox)
          }
        } else {
          if (answers.length > 0) {
            const answer = answers[0]
            await room.say(answer?.content as string, ...[ talker ])
          }
        }
        isCozeCreating = false
      } catch (err) {
        log.error('coze bot err:', err)
        isCozeCreating = false
      }
    }
  }

}

// 构建机器人
const ops: any = {
  name: 'coze-wechaty-bot',
  puppet,
} // 默认web版微信客户端
log.info('puppet:', puppet)

switch (puppet) {
  case 'wechaty-puppet-service':// 企业版微信客户端
    ops.puppetOptions = { token }
    process.env['WECHATY_PUPPET_SERVICE_NO_TLS_INSECURE_CLIENT'] = 'true'
    process.env['WECHATY_PUPPET_SERVICE_AUTHORITY'] = 'token-service-discovery-test.juzibot.com'
    break
  case 'wechaty-puppet-wechat4u':
    break
  case 'wechaty-puppet-wechat':// web版微信客户端
    ops.puppetOptions = { uos: true }
    break
  case 'wechaty-puppet-xp':
    break
  case 'wechaty-puppet-padlocal':
    ops.puppetOptions = { token }
    break
  case 'wechaty-puppet-bridge':
    ops.puppet = new PuppetBridge()
    break
  default:
    log.info('不支持的puppet')
}

const bot = WechatyBuilder.build(ops)
bot.on('scan', onScan)
bot.on('login', onLogin)
bot.on('ready', onReady)
bot.on('logout', onLogout)
bot.on('message', onMessage)
bot.on('friendship', async friendship => {
  try {
    switch (friendship.type()) {

      // 1. New Friend Request

      case bot.Friendship.Type.Receive:
        await friendship.accept()
        await friendship.contact().say('你好，我是你的智能助手瓦力。发送 帮助 获取操作说明')
        break

        // 2. Friend Ship Confirmed

      case bot.Friendship.Type.Confirm:
        log.info('case bot.Friendship.Type.Confirm:', '好友请求被确认')
        await friendship.contact().say('你好，我是你的智能助手瓦力。发送 帮助 获取操作说明~')
        break
    }
  } catch (e) {
    console.error(e)
  }
})

bot.start()
  .then(() => log.info('StarterBot', 'Starter Bot Started.'))
  .catch(e => {
    log.error('StarterBot 失败...', e)
  })
