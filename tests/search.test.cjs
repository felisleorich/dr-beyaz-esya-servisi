const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {normalize,rank}=require('../assets/site-search.js');
const records=require('../assets/search-index.json');
test('Turkish letters and uppercase normalize consistently',()=>{
  assert.equal(normalize('ÇAMAŞIR İÇİN ARÇELİK'),'camasir icin arcelik');
});
for (const [query,url] of [
  ['arcelik camasir','arcelik-camasir-makinesi-servisi.html'],
  ['ARÇELİK ÇAMAŞIR','arcelik-camasir-makinesi-servisi.html'],
  ['Yeni Mahalle','yeni-beyaz-esya-servisi.html'],
  ['bahcelievler buzdolabi','bahcelievler-buzdolabi-servisi.html'],
  ['Buzdolabı soğutmuyor','buzdolabi-sogutmuyor.html'],
  ['boch buzdolabi','bosch-buzdolabi-servisi.html'],
  ['buz dolabi servisi','buzdolabi-servisi.html'],
  ['miele camasir makina','miele-camasir-makinesi-servisi.html']
]) test('Relevant first result: '+query,()=>assert.equal(rank(records,query)[0]?.url,url));
test('Empty and unknown searches have no matches',()=>{
  for(const q of ['', ' ', 'x', 'zzolmayanxyz', '<script>alert(12345)</script>']) assert.equal(rank(records,q).length,0);
});
test('Public index has safe, unique, existing URLs only',()=>{
  assert.equal(new Set(records.map(r=>r.url)).size,records.length);
  assert.ok(records.length>600);
  for(const r of records){
    assert.match(r.url,/^(?:(?:en|blog)\/)?[a-z0-9-]+\.html$/);
    assert.doesNotMatch(r.url,/hesap-|site-editor|outputs|arama\.html/);
    assert.ok(fs.existsSync(path.join(__dirname,'..',r.url)));
    assert.ok(r.title && r.description);
  }
});
test('Line breaks preserve readable words and guides have the right category',()=>{
  assert.equal(records.find(r=>r.url==='buzdolabi-servisi.html').title,'Buzdolabı Servisi');
  assert.equal(records.find(r=>r.url==='arcelik-hata-kodlari.html').category,'guide');
});
