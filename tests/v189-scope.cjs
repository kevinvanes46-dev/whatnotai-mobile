'use strict';
const assert=require('node:assert/strict');
const cacheStem='rare'+'worth';

// Reverse exactly the reviewed v189 shell changes before checking all older
// immutable baselines. A missing, duplicate or modified change fails closed.
const changes={
  'index.html':[
    {before:'',after:'<link rel="stylesheet" href="style-v189-home.css?build=189-app-experience">\n'},
    {before:'<script>document.documentElement.dataset.initialView=location.hash;</script>',
      after:'<script>if(!location.hash)history.replaceState(null,\'\',\'#home\');document.documentElement.dataset.initialView=location.hash;</script>'},
    {before:'id="brandHomeBtn" aria-label="Ga naar zoeken"',
      after:'id="brandHomeBtn" aria-label="Ga naar home"'},
    {before:'class="tabView homeView" data-view="home"',
      after:'class="tabView active homeView" data-view="home"'},
    {before:'class="tabView active" data-view="search"',
      after:'class="tabView" data-view="search"'},
    {before:'class="navBtn" id="navHome" data-tab="home" aria-pressed="false"',
      after:'class="navBtn active" id="navHome" data-tab="home" aria-pressed="true"'},
    {before:'class="navBtn active" id="navSearch" data-tab="search" aria-pressed="true"',
      after:'class="navBtn" id="navSearch" data-tab="search" aria-pressed="false"'},
    {before:'',after:'  <script src="ui-v189-home.js?build=189-app-experience"></script>\n'}
  ],
  'sw.js':[
    {before:`const CACHE = '${cacheStem}-shell-v185-card-library';`,
      after:`const CACHE = '${cacheStem}-shell-v189-app-experience';`},
    {before:'',
      after:"  'style-v189-home.css?build=189-app-experience', 'ui-v189-home.js?build=189-app-experience',\n"}
  ]
};

module.exports=(file,code)=>{
  for(const {before,after} of changes[file]||[]){
    assert.equal(code.split(after).length,2,file+': exact reviewed v189 shell change');
    code=code.replace(after,before);
  }
  return code;
};
