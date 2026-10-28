const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({
  testDir:'./tests/browser', fullyParallel:true, forbidOnly:!!process.env.CI,
  retries:process.env.CI?1:0, workers:2, timeout:30000,
  reporter:[['list'],['html',{open:'never'}]],
  use:{baseURL:'http://127.0.0.1:8775',trace:'retain-on-failure',screenshot:'only-on-failure',reducedMotion:'reduce'},
  projects:[
    {name:'chromium-desktop',use:{browserName:'chromium',viewport:{width:1365,height:900}}},
    {name:'chromium-small-mobile',use:{browserName:'chromium',viewport:{width:320,height:780},isMobile:true,hasTouch:true}},
    {name:'webkit-mobile',use:{browserName:'webkit',viewport:{width:390,height:844},isMobile:true,hasTouch:true}}
  ],
  webServer:{command:'python3 -m http.server 8775 --bind 127.0.0.1',url:'http://127.0.0.1:8775',reuseExistingServer:!process.env.CI,timeout:15000}
});
