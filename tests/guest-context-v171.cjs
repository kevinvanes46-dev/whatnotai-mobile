'use strict';
// Existing regression suites exercise the already-onboarded local app. First-run,
// real guest choice and session handling are covered independently in v171.
module.exports=function guestContexts(chromium){
  const launch=chromium.launch.bind(chromium);
  chromium.launch=async options=>{
    const browser=await launch(options),newContext=browser.newContext.bind(browser);
    browser.newContext=async options=>{
      const context=await newContext(options);
      await context.addInitScript(()=>localStorage.setItem('rareworth_onboarding_v171','guest'));
      return context;
    };
    browser.newPage=async options=>(await browser.newContext(options)).newPage();
    return browser;
  };
};
