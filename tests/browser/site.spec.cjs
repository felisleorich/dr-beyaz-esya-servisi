const {test,expect}=require('@playwright/test');

test.beforeEach(async({page})=>{
  // Tests inspect the site, without generating analytics visits or contacting customers.
  await page.route(/google-analytics\.com|googletagmanager\.com|doubleclick\.net/,route=>route.abort());
});

test('Search is lazy, relevant, keyboard accessible, and restores focus',async({page})=>{
  let indexRequests=0;
  page.on('request',request=>{if(request.url().includes('search-index.json'))indexRequests++;});
  await page.goto('/index.html');
  expect(indexRequests).toBe(0);
  const trigger=page.locator('[data-site-search]');
  await trigger.click();
  const dialog=page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const input=dialog.getByRole('searchbox');
  await expect(input).toBeFocused();
  await input.fill('arcelik camasir');
  const first=dialog.locator('.sx-result').first();
  await expect(first).toHaveAttribute('href',/arcelik-camasir-makinesi-servisi.html$/);
  expect(indexRequests).toBe(1);
  await input.press('ArrowDown'); await expect(first).toBeFocused();
  await first.press('Escape'); await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click(); await expect(input).toBeFocused();
  await expect(first).toHaveAttribute('href',/arcelik-camasir-makinesi-servisi.html$/);
  await first.click(); await expect(page).toHaveURL(/arcelik-camasir-makinesi-servisi.html$/);
});

test('Search empty state, clearing, dedicated page and query privacy',async({page})=>{
  await page.goto('/arama.html#q=Yeni%20Mahalle');
  const input=page.getByRole('searchbox');
  await expect(page.locator('.sx-result').first()).toHaveAttribute('href',/yeni-beyaz-esya-servisi.html$/);
  await input.fill('zzolmayanxyz');
  await expect(page.getByRole('status')).toContainText('eşleşen sayfa bulunamadı');
  await expect(page.locator('.sx-help-link')).toHaveAttribute('href','tel:+905428912225');
  await page.getByRole('button',{name:'Aramayı temizle'}).click();
  await expect(input).toHaveValue('');
  await expect(page.getByRole('status')).toHaveText('Hızlı ulaşın');
  await input.fill('Bahçelievler buzdolabı'); await input.press('Enter');
  await expect(page.locator('.sx-result').first()).toHaveAttribute('href',/bahcelievler-buzdolabi-servisi.html$/);
  expect(new URL(page.url()).search).toBe('');
  expect(decodeURIComponent(new URL(page.url()).hash)).toContain('Bahçelievler buzdolabı');
});

test('Search failure provides retry and useful contact fallback',async({page})=>{
  let fail=true;
  await page.route('**/search-index.json*',route=>fail?route.abort():route.continue());
  await page.goto('/arama.html');
  await expect(page.getByRole('status')).toContainText('Arama şu anda yüklenemedi');
  fail=false;
  await page.getByRole('button',{name:'Yeniden dene',exact:true}).click();
  await expect(page.locator('.sx-result').first()).toBeVisible();
});

test('Mobile header, theme, menu and English search remain usable',async({page})=>{
  await page.goto('/en/index.html');
  const menu=page.locator('.ds-header .menu');
  const theme=page.locator('.ds-header .theme-toggle');
  await expect(page.locator('[data-site-search]')).toBeVisible();
  const before=await page.locator('html').getAttribute('data-theme');
  await theme.click(); await expect(page.locator('html')).not.toHaveAttribute('data-theme',before);
  await page.locator('[data-site-search]').click();
  await page.getByRole('searchbox').fill('Refrigerator');
  await expect(page.locator('.sx-result').first()).toBeVisible();
  await page.getByRole('button',{name:'Close search',exact:true}).click();
  if(await menu.isVisible()){
    await menu.click(); await expect(menu).toHaveAttribute('aria-expanded','true');
    await menu.press('Escape'); await expect(menu).toHaveAttribute('aria-expanded','false');
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});

test('Every homepage photo counter stays finite and advances independently',async({page})=>{
  await page.goto('/index.html');
  const galleries=page.locator('.gx-gallery');
  await expect(galleries).toHaveCount(8);
  for(const gallery of await galleries.all()){
    await gallery.scrollIntoViewIfNeeded();
    const counter=gallery.locator('.gx-photo-status');
    const next=gallery.locator('[data-gx-next]');
    await expect(next).toBeEnabled(); await next.click();
    await expect(counter).toHaveText(/^2 \/ [23]$/);
    await gallery.locator('[data-gx-prev]').click(); await expect(counter).toHaveText(/^1 \/ [23]$/);
  }
  await galleries.last().locator('[data-gx-next]').click();
  await expect(galleries.last().locator('img').nth(1)).toHaveAttribute('src',/kombi-yanma/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});

for(const route of ['/index.html','/arama.html','/buzdolabi-servisi.html','/yeni-beyaz-esya-servisi.html','/miele-camasir-makinesi-servisi.html','/iletisim.html']){
  test('Public template renders without script errors: '+route,async({page},testInfo)=>{
    const errors=[]; page.on('pageerror',error=>errors.push(error.message));
    const response=await page.goto(route); expect(response.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    const hero=page.locator('.ds-hero-art img').first();
    if(await hero.count()) await expect.poll(()=>hero.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
    await page.screenshot({path:testInfo.outputPath('page.png')});
    expect(errors).toEqual([]);
  });
}
