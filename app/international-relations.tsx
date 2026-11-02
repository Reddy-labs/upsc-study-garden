'use client';
import {useState} from 'react';
import type {ReactNode} from 'react';
import {ArrowLeft,ArrowUpRight,BookOpen,ChevronRight,Download,Globe,Map,Search} from 'lucide-react';
import {irCourse,irTopics,irThemeForTopic,type IRTopic,type IRVisual} from '@/lib/ir-lessons';
import type {StudyTopic} from './study-tools';
import irPyqs from '@/data/ir-pyqs.json';

export function IRSubjectCard({onOpen}:{onOpen:()=>void}){
 return <button className="ir-subject-card" onClick={onOpen}>
  <span className="ir-subject-icon"><Globe size={28}/></span>
  <span className="ir-subject-copy"><span className="eyebrow">GS 2 · SUBJECT COLLECTION</span><strong>International Relations</strong><span>{irCourse.themes.length} themes · {irTopics.length} lessons · {irPyqs.length} PYQ demands · maps & answer writing</span></span>
  <ArrowUpRight size={22}/>
 </button>;
}

export function InternationalRelations({onOpen,onPyqs,onBack}:{onOpen:(topic:StudyTopic)=>void;onPyqs:()=>void;onBack:()=>void}){
 const [theme,setTheme]=useState('all'),[query,setQuery]=useState('');
 const needle=query.trim().toLowerCase();
 const matching=irTopics.filter(topic=>(theme==='all'||topic.theme===theme)&&(!needle||[topic.title,topic.description,...topic.blocks.map(block=>block.text)].join(' ').toLowerCase().includes(needle)));
 return <section className="ir-course" aria-labelledby="ir-course-title">
  <button className="text-btn" onClick={onBack}><ArrowLeft size={15}/>GS 2 subjects</button>
  <div className="ir-course-heading"><div><div className="eyebrow">GS 2 / INTERNATIONAL RELATIONS</div><h1 id="ir-course-title">Understand the world.<br/><em>Explain India’s choices.</em></h1><p>Study by theme. Connect interests, mechanisms and examples, then close the notes and recall.</p></div><span className="ir-globe" aria-hidden="true"><Globe size={68}/></span></div>
  <div className="ir-course-stats"><span><b>{irCourse.themes.length}</b> organised themes</span><span><b>{irTopics.length}</b> reading lessons</span><span><b>{irPyqs.length}</b> PYQ demands · 2013–2026</span><span><b>4</b> study maps</span></div>
  <div className="ir-start-panel"><div><span className="eyebrow">START HERE</span><h2>Learn the thinking framework first.</h2><p>Place → flows → India’s interests → risks → constraints → response. Then use only the lenses the question needs.</p><button className="primary" onClick={()=>onOpen(irTopics[0])}>Open thinking frameworks<ChevronRight size={15}/></button></div><div className="ir-resources"><a href={irCourse.pdf} download><Download size={17}/><span>Download full guide<small>55-page PDF · 2 Nov 2026</small></span><ArrowUpRight size={15}/></a><button onClick={onPyqs}><BookOpen size={17}/><span>Explore IR PYQs<small>Demand, answer route & linked lessons</small></span><ChevronRight size={15}/></button><button onClick={()=>onOpen(irTopics.find(t=>t.id==='ir-revision-plan')!)}><Map size={17}/><span>Follow the revision cycle<small>21 days · recall and writing</small></span><ChevronRight size={15}/></button></div></div>
  <div className="ir-controls"><label className="search-box"><Search size={17}/><input aria-label="Search International Relations" placeholder="Search a country, institution, concept or example…" value={query} onChange={event=>setQuery(event.target.value)}/></label><select aria-label="Filter IR by theme" value={theme} onChange={event=>setTheme(event.target.value)}><option value="all">All themes</option>{irCourse.themes.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}</select></div>
  <p className="result-count" aria-live="polite">{matching.length} lessons shown · Your study progress is recorded only through your own saved work.</p>
  {matching.length===0?<div className="study-empty"><h2>No matching lesson.</h2><p>Try a country, concept, or a different theme.</p><button className="secondary" onClick={()=>{setQuery('');setTheme('all');}}>Clear filters</button></div>:irCourse.themes.filter(item=>matching.some(topic=>topic.theme===item.id)).map(item=><section className="ir-theme-section" key={item.id} aria-labelledby={'ir-theme-'+item.id}>
   <div className="ir-theme-heading"><span className="ir-theme-number">{String(irCourse.themes.indexOf(item)+1).padStart(2,'0')}</span><div><h2 id={'ir-theme-'+item.id}>{item.title}</h2><p>{item.description}</p></div></div>
   <div className="ir-topic-grid">{matching.filter(topic=>topic.theme===item.id).map(topic=>{const linked=irPyqs.filter(pyq=>pyq.topics.includes(topic.id)).length;return <button className="topic-card" key={topic.id} onClick={()=>onOpen(topic)}><div className="topic-card-top"><span className="topic-paper">{topic.id.startsWith('ir-model-')?'MODEL ANSWER':'GS 2 · IR'}</span><ArrowUpRight size={16}/></div><h3>{topic.title}</h3><p>{topic.description}</p><div className="topic-card-bottom"><span>{linked?linked+' linked PYQ'+(linked===1?'':'s'):'Learn & recall'}{topic.blocks.some(block=>block.visual?.type==='map')?' · Map included':''}</span><ChevronRight size={15}/></div></button>;})}</div>
  </section>)}
  <div className="ir-evidence-note"><BookOpen size={18}/><p>PYQs are clearly labelled paraphrases. Topper observations use coaching practice copies. Dated examples and source links are retained from your guide. <button className="text-btn" onClick={()=>onOpen(irTopics.find(topic=>topic.id==='ir-sources')!)}>Read verification notes<ArrowUpRight size={13}/></button></p></div>
 </section>;
}

export function IRReaderNavigation({topic,onHome,onOpen,onJump}:{topic:IRTopic;onHome:()=>void;onOpen:(topic:StudyTopic)=>void;onJump:(id:string)=>void}){
 const theme=irThemeForTopic(topic.id),siblings=irTopics.filter(item=>item.theme===topic.theme),index=siblings.findIndex(item=>item.id===topic.id);
 return <div className="ir-reader-navigation"><div className="ir-reader-path"><button onClick={onHome}>International Relations</button><ChevronRight size={13}/><span>{theme?.title}</span></div><div className="ir-reader-resource-links"><a href={topic.sourceUrl} target="_blank" rel="noreferrer"><BookOpen size={14}/>Guide page {topic.guidePages[0]}<ArrowUpRight size={13}/></a><a href={irCourse.pdf} download><Download size={14}/>Full PDF</a></div><details className="ir-section-menu"><summary>Jump to a lesson section</summary><nav aria-label="IR lesson sections">{topic.blocks.filter(block=>block.heading).map(block=><button key={block.id} onClick={()=>onJump(block.id)}>{block.text}<ChevronRight size={13}/></button>)}</nav></details><div className="ir-reader-neighbours"><button disabled={index===0} onClick={()=>onOpen(siblings[index-1])}><ArrowLeft size={14}/>Previous in theme</button><button disabled={index===siblings.length-1} onClick={()=>onOpen(siblings[index+1])}>Next in theme<ChevronRight size={14}/></button></div></div>;
}

export function IRVisualBlock({visual,text,children,hasSavedWork=false}:{visual:IRVisual;text:string;children:ReactNode;hasSavedWork?:boolean}){
 return <div className={'ir-visual ir-visual-'+visual.type}>
  {visual.type==='table'&&<div className="ir-table-scroll" tabIndex={0} role="region" aria-label="Study comparison table"><table><thead><tr>{visual.headers.map((cell,i)=><th key={i} scope="col">{cell}</th>)}</tr></thead><tbody>{visual.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=>j===0?<th key={j} scope="row">{cell}</th>:<td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>}
  {visual.type==='flow'&&<ol className="ir-flow" aria-label="Cause and effect">{visual.steps.map((step,i)=><li key={i}><span className="ir-flow-count">{i+1}</span><span>{step}</span>{i<visual.steps.length-1&&<ChevronRight size={17} aria-hidden="true"/>}</li>)}</ol>}
  {visual.type==='mindmap'&&<div className="ir-mindmap"><div className="ir-mindmap-center">{visual.center}</div><ul>{visual.arms.map((arm,i)=><li key={i}>{arm}</li>)}</ul></div>}
  {visual.type==='map'&&<figure className="ir-map"><a href={visual.src} target="_blank" rel="noreferrer"><img src={visual.src} alt={visual.alt} width={1700} height={820} loading="lazy"/></a><figcaption>{text}<a href={visual.src} download><Download size={13}/>Download map</a></figcaption></figure>}
  <details className="ir-visual-transcript" open={hasSavedWork||undefined}><summary>Text version for highlighting & notes</summary>{children}</details>
 </div>;
}

export function IRSources({topic}:{topic:IRTopic}){
 if(!topic.sources.length)return null;
 return <details className="ir-source-links"><summary>Evidence & source links ({topic.sources.length})</summary><ul>{topic.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}<ArrowUpRight size={12}/></a></li>)}</ul></details>;
}
