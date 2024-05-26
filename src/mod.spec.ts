#!/usr/bin/env -S node --no-warnings --loader ts-node/esm

import { test } from 'tstest'

import * as contrib from './mod.js'

test('Make sure the module export list is expected', async t => {
  t.ok(contrib.EventLogger, 'should has #2 EventLogger')
  // t.ok(contrib.EventHotHandler, 'should has #9 EventHotHandler')
})
