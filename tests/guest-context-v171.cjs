'use strict';
// Existing regression suites exercise the already-onboarded local app. First-run,
// real guest choice and session handling are covered independently in v171.
module.exports=function guestContexts(chromium){
  const launch=chromium.launch.bind(chromium);
  chromium.launch=async options=>{
    const browser=await launch(options),newContext=browser.newContext.bind(browser);
    browser.newContext=async options=>{
      const context=await newContext(options);
      await context.addInitScript(()=>sessionStorage.setItem('rareworth_guest_session_v171_1','1'));
      return context;
    };
    browser.newPage=async options=>(await browser.newContext(options)).newPage();
    return browser;
  };
};
