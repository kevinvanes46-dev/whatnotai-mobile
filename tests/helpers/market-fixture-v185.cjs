'use strict';
// Test server only: exercise the unchanged CommonJS financial engine with
// intercepted fixture responses. No production flag, provider or asset changes.
module.exports=()=>`(function(module){${require('node:fs').readFileSync('market-v176.js','utf8')}
Object.defineProperty(window,'HoloKeepMarket',{value:module.exports});
})({exports:{}});`;
