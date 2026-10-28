const {test,expect}=require('@playwright/test');

test.beforeEach(async({page})=>{
  await page.route(/google-analytics\.com|googletagmanager\.com|doubleclick\.net/,route=>route.abort());
});

test('Search treats malicious-looking queries as text',async({page})=>{
  const text='<img src=x onerror="window.auditProbe=1">';
  await page.goto('/arama.html#q='+encodeURIComponent(text));
  await expect(page.getByRole('searchbox')).toHaveValue(text);
  await expect(page.getByRole('status')).toContainText('eşleşen sayfa bulunamadı');
  expect(await page.evaluate(()=>window.auditProbe)).toBeUndefined();
  await expect(page.locator('.sx-results img')).toHaveCount(0);
});

test('Appointment draft stays local, escapes text and uses the fixed WhatsApp recipient',async({page})=>{
  const text='<img src=x onerror="window.auditProbe=1">';
  const requests=[];page.on('request',r=>requests.push(r.url()));
  await page.goto('/iletisim.html?cihaz=Buzdolab%C4%B1&mahalle=Yeni%20Mahalle&marka='+encodeURIComponent(text));
  await expect(page.locator('#request-cihaz')).toHaveValue('Buzdolabı');
  await page.locator('#request-sorun').fill('Soğutmuyor. '+text);
  await page.getByRole('button',{name:'Talebimi hazırla'}).click();
  await expect(page.locator('#appointment-result')).toBeVisible();
  await expect(page.locator('#appointment-message')).toHaveValue(new RegExp('Soğutmuyor'));
  const url=new URL(await page.locator('#appointment-send').getAttribute('href'));
  expect(url.origin).toBe('https://wa.me');expect(url.pathname).toBe('/905428912225');
  expect(url.searchParams.get('text')).toContain(text);
  expect(await page.evaluate(()=>window.auditProbe)).toBeUndefined();
  expect(requests.filter(u=>u.includes('wa.me')||u.includes(encodeURIComponent(text))&&u.includes('/collect'))).toEqual([]);
  await page.locator('#request-sorun').fill('Yeni açıklama');
  await expect(page.locator('#appointment-result')).toBeHidden();
});

test('Error code filters and official detail links still work with CSP',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/hata-kodlari.html?brand=Bosch&q=E18');
  await expect(page.locator('#results .error-card').first()).toBeVisible();
  await expect(page.locator('#results a[href="bosch-e18-hata-kodu.html"]').first()).toBeVisible();
  await page.locator('#search').fill('<svg onload="window.auditProbe=1">');
  await expect(page.locator('.error-search-empty')).toBeVisible();
  expect(await page.evaluate(()=>window.auditProbe)).toBeUndefined();expect(errors).toEqual([]);
});

test('Brand and neighbourhood filters retain correct service links',async({page})=>{
  await page.goto('/markalar.html');
  await page.locator('#brand-search').fill('arcelik');
  await page.locator('#brand-device').selectOption('camasir-makinesi');
  await expect(page.locator('[data-brand-name]:visible .ds-card-link')).toHaveAttribute('href','arcelik-camasir-makinesi-servisi.html');
  await page.goto('/pendik-mahalleleri.html');
  await page.locator('#neighborhood-search').fill('Bahçelievler');
  await expect(page.locator('#neighborhood-list a:visible')).toHaveCount(1);
  await expect(page.locator('#neighborhood-list a:visible')).toHaveAttribute('href','bahcelievler-beyaz-esya-servisi.html');
});

test('Service finder respects the selected device and request intent',async({page})=>{
  await page.goto('/hizmetler.html');
  await page.locator('[name="device"]').selectOption('firin');
  await page.locator('[name="intent"]').selectOption('service');
  await page.getByRole('button',{name:'Devam edin'}).click();
  await expect(page).toHaveURL(/firin-ocak-servisi.html$/);
});

test('CSP blocks unknown inline script and injected handlers',async({page})=>{
  await page.goto('/index.html');
  await page.evaluate(()=>{
    const script=document.createElement('script');script.textContent='window.auditProbe=1';document.body.append(script);
    const button=document.createElement('button');button.setAttribute('onclick','window.auditProbe=2');document.body.append(button);button.click();
  });
  expect(await page.evaluate(()=>window.auditProbe)).toBeUndefined();
});
