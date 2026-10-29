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

const {anchorSelection}=load('lib/selection-anchor.ts');
assert.deepEqual(anchorSelection('First paragraph.','First paragraph.\n\n',0),{quote:'First paragraph.',start:0,end:16});
assert.deepEqual(anchorSelection('  British India','  British India\n',0),{quote:'British India',start:2,end:15});
assert.equal(anchorSelection('First paragraph.','First paragraph.\nAnother paragraph.',0),null);
assert.equal(anchorSelection('First paragraph.','   ',0),null);
console.log('PASS: paragraph selection boundaries, whitespace offsets and multi-paragraph rejection.');
const course=load('lib/essay-lessons.ts');
assert.deepEqual(course.essayCourse.map(entry=>entry.day),Array.from({length:19},(_,i)=>i+1));
assert.deepEqual(course.essayCourse.filter(entry=>entry.status==='awaiting-original').map(entry=>entry.day),[1,2,3,4,5,6,7,8,15,16]);
assert.deepEqual(course.essayLessons.map(lesson=>lesson.day),[9,10,11,12,13,14,17,18,19]);
assert.deepEqual(course.essayCourse.filter(entry=>entry.status==='imported').map(entry=>entry.day),course.essayLessons.map(lesson=>lesson.day));
const allIds=new Set([...topics,...course.essayTopics].map(topic=>topic.id));assert.equal(allIds.size,50);
for(const lesson of course.essayLessons){
 const topic=course.essayTopics.find(topic=>topic.id===course.essayLessonId(lesson.day));assert(topic);
 assert.equal(lesson.recallQuestions.length,2);assert(lesson.anchors.length>=4&&lesson.anchors.length<=6);
 for(const section of ['new-concept','older-recall','topic-decoding','thesis','framework','content-anchors','outline'])assert(lesson.sections.some(item=>item.id===section));
 assert(lesson.essay.length>=8);assert(lesson.essay.join(' ').split(/\s+/).length>900);
 assert(lesson.writePrompt.length>30);assert(lesson.boundary.length>40);assert(lesson.sources.length>0);
 for(const source of lesson.sources)assert(new URL(source.url).protocol==='https:');
 assert.equal(new Set(topic.blocks.map(block=>block.id)).size,topic.blocks.length);
 assert(topic.blocks.some(block=>block.id==='model-essay-heading'));
 assert(topic.blocks.some(block=>block.id==='write-prompt'));
 assert.equal(tools.quickBlocks(topic).length,8);
 assert(tools.shortNoteText(topic,[]).includes(lesson.thesis));
 assert.equal(course.lessonForTopic(topic.id),lesson);
 if(lesson.questionType==='practice')assert(!lesson.year);
 if(lesson.questionType==='pyq')assert([2020,2021,2022,2023,2024].includes(lesson.year));
}
assert(course.essayLessons.find(lesson=>lesson.day===14).sections.some(section=>section.id==='weekly-transfer'));
const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');const classroom=load('app/essay-classroom.tsx');
const html=renderToStaticMarkup(React.createElement(classroom.EssayClassroom,{onOpen:()=>{}}));
assert.equal((html.match(/data-essay-day=/g)||[]).length,19);
assert.equal((html.match(/>Read Day /g)||[]).length,9);
assert.equal((html.match(/>Awaiting original</g)||[]).length,10);
assert(html.includes('9 full lessons')&&html.includes('10 awaiting originals'));
assert(html.includes('All 19 days'));
assert(!html.includes('14-day'));
assert(html.includes('not a claim that you completed'));
for(const day of [17,18,19]){
 const lesson=course.essayLessons.find(lesson=>lesson.day===day);
 const wordCount=lesson.essay.join(' ').split(/\s+/).length;assert(wordCount>=1000&&wordCount<=1200);
 const topic=course.essayTopics.find(topic=>topic.id===course.essayLessonId(day));
 assert.equal(topic.blocks.find(block=>block.id==='recall-card').text,lesson.recallCard);
 assert.equal(topic.blocks.find(block=>block.id==='daily-routine').text,lesson.dailyRoutine);
 const nav=renderToStaticMarkup(React.createElement(classroom.EssayLessonNavigation,{lesson,onOpen:()=>{},onJump:()=>{}}));
 assert(nav.includes('DAY '+day+' OF 19'));
 const sourcePanel=renderToStaticMarkup(React.createElement(classroom.EssayQuestionSource,{topicId:topic.id}));
 assert(sourcePanel.includes('www.upsc.gov.in/sites/default/files/QP-CSM-'));
 assert(sourcePanel.includes(lesson.year.toString()));
}
assert(course.essayLessons.find(lesson=>lesson.day===17).dailyRoutine.includes('risk reduction and preparedness'));
assert(course.essayLessons.find(lesson=>lesson.day===18).dailyRoutine.includes('does not necessarily mean'));
const day19=course.essayLessons.find(lesson=>lesson.day===19);
assert.equal(day19.framework,'Public issue');assert.equal(day19.year,2023);
assert(day19.dailyRoutine.includes('C17 and C08'));
assert(day19.writePrompt.includes('family-level action')&&day19.writePrompt.includes('institutional action'));
assert(course.essayCourse.find(entry=>entry.day===19).conceptId==='C18');
const originalTopic=course.essayTopics[0];const originalBlock=originalTopic.blocks.find(block=>block.id==='essay-paragraph-01');
const savedEssay={id:'essay-annotation-test',kind:'annotation',payload:{id:'essay-annotation-test',topicId:originalTopic.id,blockId:originalBlock.id,quote:originalBlock.text.slice(0,25),start:0,end:25,color:'yellow',tags:['essay revision'],note:'Keep the qualification',due:'2026-10-27',step:0,type:'highlight'}};
await store.saveRecord(savedEssay);assert.equal((await store.readRecords())[0].payload.blockId,'essay-paragraph-01');await store.deleteRecord(savedEssay.id);
console.log('PASS: 19 honest day slots, 9 complete imported lessons, unique annotation anchors, full essays, concepts, sources and lesson-specific writing prompts.');
console.log('PASS: Essay classroom server rendering, missing-source labels, quick revision, short notes and essay highlight storage.');
