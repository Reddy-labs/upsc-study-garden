import {createRequire} from 'node:module';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=resolve('.');const require=createRequire(resolve(root,'package.json'));const ts=require('typescript');require('fake-indexeddb/auto');
const cache=new Map();
function load(file){file=resolve(root,file);if(cache.has(file))return cache.get(file);const module={exports:{}};cache.set(file,module.exports);const source=readFileSync(file,'utf8');const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const localRequire=(path)=>{if(path.startsWith('@/')||path.startsWith('.')){let p=path.startsWith('@/')?resolve(root,path.slice(2)):resolve(dirname(file),path);if(p.endsWith('.json'))return JSON.parse(readFileSync(p,'utf8'));if(!existsSync(p)){if(existsSync(p+'.ts'))p+='.ts';else if(existsSync(p+'.tsx'))p+='.tsx';}return load(p);}return createRequire(file)(path);};
 vm.runInThisContext('(function(require,module,exports){'+code+'\n})',{filename:file})(localRequire,module,module.exports);cache.set(file,module.exports);return module.exports;}
const store=load('lib/client-records.ts');
assert.deepEqual(await store.readRecords(),[]);
const a={id:'test-highlight',kind:'annotation',payload:{id:'test-highlight',topicId:'post-02',blockId:'b0',quote:'Why did signing',start:0,end:15,color:'yellow',tags:['needs recall','essay example'],note:'A note about consent',due:'2026-10-27',step:0,type:'highlight'}};
await store.saveRecord(a);let rows=await store.readRecords();assert.equal(rows.length,1);assert.deepEqual(rows[0].payload.tags,a.payload.tags);
a.payload.due='2026-10-30';a.payload.color='green';await store.saveRecord(a);rows=await store.readRecords();assert.equal(rows.length,1);assert.equal(rows[0].payload.due,'2026-10-30');assert.equal(rows[0].payload.color,'green');
await assert.rejects(()=>store.saveRecord({...a,payload:{...a.payload,due:'2026-02-31'}}));await assert.rejects(()=>store.saveRecord({...a,payload:{...a.payload,end:0}}));
const topic={id:'custom-qa',title:'QA notes',paper:'GS2',subject:'Governance',description:'QA test',blocks:[{id:'b0',text:'Problem → mechanism → outcome'}],source:'QA'};await store.saveRecord({id:topic.id,kind:'topic',payload:topic});await store.saveRecord({id:'recall-qa',kind:'attempt',payload:{topicId:topic.id,answer:'A recalled answer'}});
const backup=JSON.parse(JSON.stringify({version:1,records:await store.readRecords()}));for(const r of backup.records)await store.deleteRecord(r.id);assert.equal((await store.readRecords()).length,0);for(const r of backup.records)await store.saveRecord(r);assert.equal((await store.readRecords()).length,3);
for(const r of backup.records)await store.deleteRecord(r.id);
const topics=JSON.parse(readFileSync('data/topics.json'));const revisions=JSON.parse(readFileSync('data/revision.json'));const pyqs=JSON.parse(readFileSync('data/pyqs.json'));const ids=new Set(topics.map(t=>t.id));assert.equal(ids.size,41);
for(const t of topics){assert(t.blocks.length);assert.equal(new Set(t.blocks.map(b=>b.id)).size,t.blocks.length);for(const b of t.blocks)assert(b.text.trim());if(t.sourceUrl)assert(t.sourceUrl.startsWith('/#'));}
assert.equal(Object.keys(revisions).length,38);for(const[id,r]of Object.entries(revisions)){assert(ids.has(id));assert(r.chain.length>25);assert(r.keywords.length>=4);for(const p of r.points){assert(p.text.length>12);assert(!p.text.endsWith('1.'));}}
assert.equal(pyqs.length,31);for(const p of pyqs){assert(['provisional','paraphrase'].includes(p.status));for(const id of p.topics)assert(ids.has(id));assert(ids.has(p.sourceTopic));}
const tools=load('app/study-tools.tsx');const example=topics.find(t=>t.id==='post-02');assert(tools.shortNoteText(example,[]).includes('paramountcy'));const personalised=tools.shortNoteText(example,[{quote:'A saved passage',note:'My thought',tags:['essay example']}]);for(const text of ['A saved passage','My thought','essay example'])assert(personalised.includes(text));
const schedule=load('lib/revision-schedule.ts');const clock=new Date('2026-10-27T22:00:00Z');assert.equal(schedule.dateIn(0,clock),'2026-10-28');for(const [step,expected]of [[0,'2026-10-31'],[1,'2026-11-04'],[2,'2026-11-11'],[3,'2026-11-27'],[4,'2026-11-27']])assert.equal(schedule.reviewSchedule(step,true,clock).due,expected);assert.equal(schedule.reviewSchedule(4,false,clock).due,'2026-10-29');
console.log('PASS: IndexedDB save/read/update/delete, tags, colours, invalid-record rejection and backup round-trip.');
console.log('PASS: 41 documents, 38 revision cards, 31 labelled PYQ routes and all topic anchors.');
console.log('PASS: short-note generation, IST date boundaries and review scheduling.');
