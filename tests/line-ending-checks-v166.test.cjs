'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {normalizeLineEndings}=require('../scripts/normalize-line-endings.cjs');

const matches=(actual,expected)=>normalizeLineEndings(actual)===normalizeLineEndings(expected);

test('LF matches LF',()=>assert.equal(matches('first\nsecond\n','first\nsecond\n'),true));
test('CRLF matches LF',()=>assert.equal(matches('first\r\nsecond\r\n','first\nsecond\n'),true));
test('standalone CR matches LF',()=>assert.equal(matches('first\rsecond\r','first\nsecond\n'),true));
test('real content change still fails',()=>assert.equal(matches('first\nchanged\n','first\nsecond\n'),false));
test('missing line still fails',()=>assert.equal(matches('first\n','first\nsecond\n'),false));
test('extra character still fails',()=>assert.equal(matches('first\nsecond!\n','first\nsecond\n'),false));
