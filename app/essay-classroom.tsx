'use client';
import {useState} from 'react';
import {ArrowLeft,ArrowUpRight,BookOpen,ChevronRight,Clock,Search} from 'lucide-react';
import {essayCourse,essayLessons,essayTopics,essayLessonId,lessonForTopic,type EssayLesson} from '@/lib/essay-lessons';
import type {StudyTopic} from './study-tools';

const searchTextByDay=new Map(essayCourse.map(entry=>{
 const lesson=essayLessons.find(lesson=>lesson.day===entry.day);
 return [entry.day,[entry.day,entry.title,entry.conceptId,entry.conceptTitle,lesson?.topic,lesson?.thesis,...(lesson?.sections.flatMap(section=>section.paragraphs)||[])].join(' ').toLowerCase()];
}));
const missingDays=essayCourse.filter(entry=>entry.status==='awaiting-original').map(entry=>entry.day);

export function EssayClassroom({onOpen,starter}:{onOpen:(topic:StudyTopic)=>void;starter?:StudyTopic}){
 const [query,setQuery]=useState('');
 const [filter,setFilter]=useState('all');
 const rows=essayCourse.filter(entry=>(filter==='all'||entry.status===filter)&&(!query||searchTextByDay.get(entry.day)?.includes(query.trim().toLowerCase())));
 return <section className="essay-classroom" aria-labelledby="essay-classroom-title">
  <div className="eyebrow">THINK · QUESTION · WRITE</div>
  <div className="page-heading"><div><h1 id="essay-classroom-title">Your daily essay garden</h1><p>Concepts, arguments and a small daily writing ritual. Return to any of the {essayCourse.length} days.</p></div><span className="count-badge">{essayLessons.length} full lessons · {missingDays.length} awaiting originals</span></div>
  <div className="essay-archive-note" role="note"><BookOpen size={21}/><div><h2>What is available here?</h2><p>Available lessons are imported from the chat messages, including their full model essays, concept revision and writing exercises.</p>{missingDays.length>0&&<p>Days {missingDays.join(', ')} show only the recovered plan because their original messages could not be recovered. These are not invented replacements.</p>}<p>This is a lesson archive, not a claim that you completed the lessons. Your existing highlights, notes and revision history are unchanged.</p></div></div>
  <div className="essay-routine"><span><Clock size={16}/> 30–35 minutes</span><p>Recall 5 · New concept 5 · Read 10–15 · Write 10</p><small>Meaning → Claim → Mechanism → Example → Limit → Synthesis</small></div>
  <div className="essay-controls"><label className="search-box"><Search size={17}/><input aria-label="Search essay lessons" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search a day, topic or concept…"/></label><select aria-label="Filter essay availability" value={filter} onChange={event=>setFilter(event.target.value)}><option value="all">All {essayCourse.length} days</option><option value="imported">Full lessons available</option><option value="awaiting-original">Awaiting original text</option></select></div>
  <p className="result-count" aria-live="polite">{rows.length} {rows.length===1?'day':'days'} shown</p>
  {rows.length===0?<div className="study-empty"><h2>No matching lesson.</h2><p>Try a topic, concept number, or a different availability filter.</p><button className="secondary" onClick={()=>{setQuery('');setFilter('all');}}>Clear filters</button></div>:<div className="essay-day-grid">{rows.map(entry=>{
   const lesson=essayLessons.find(lesson=>lesson.day===entry.day);
   return <article key={entry.day} className={'essay-day-card '+(lesson?'available':'pending')} data-essay-day={entry.day}>
    <div className="essay-day-top"><span className="essay-day-number">DAY {String(entry.day).padStart(2,'0')}</span><span className={'essay-status '+(lesson?'available':'pending')}>{lesson?'Full lesson':'Awaiting original'}</span></div>
    <p className="essay-concept-label">{entry.conceptId} · {entry.conceptTitle}</p>
    <h2>{entry.title}</h2>
    {lesson?<><p className="essay-topic-label">{lesson.topic}</p><div className="essay-day-meta"><span>{lesson.questionType==='pyq'?'UPSC Essay '+lesson.year:'Original practice · not a PYQ'}</span><span>{lesson.framework}</span></div><button className="primary" onClick={()=>onOpen(essayTopics.find(topic=>topic.id===essayLessonId(entry.day))!)}>Read Day {entry.day}<ArrowUpRight size={15}/></button></>:<><p className="essay-topic-label">Recovered plan only. The full concept card, essay and exercises are not available in the current source.</p><p className="essay-pending-help">Paste or share the original Day {entry.day} lesson in chat to complete this slot.</p></>}
   </article>;
  })}</div>}
  {starter&&<div className="essay-starter"><div><span className="eyebrow">EXTRA ORIGINAL PRACTICE</span><h2>From thought to action</h2><p>Your original starter lesson is preserved separately from the numbered course.</p></div><button className="text-btn" onClick={()=>onOpen(starter)}>Open starter<ArrowUpRight size={15}/></button></div>}
 </section>;
}

export function EssayLessonNavigation({lesson,onOpen,onJump}:{lesson:EssayLesson;onOpen:(topic:StudyTopic)=>void;onJump:(blockId:string)=>void}){
 const index=essayLessons.findIndex(item=>item.day===lesson.day);
 const previous=essayLessons[index-1],next=essayLessons[index+1];
 const sections=[...lesson.sections.map(section=>({id:section.id+'-heading',title:section.title})),{id:'model-essay-heading',title:'Full model essay'},{id:'recall-card-heading',title:'Recall card'},{id:'daily-routine-heading',title:'Routine & writing exercise'},{id:'source-links-heading',title:'Evidence & source links'}];
 return <div className="essay-reader-navigation"><div className="essay-reader-day"><span className="pill">DAY {lesson.day} OF {essayCourse.length}</span><span>{lesson.questionType==='pyq'?'UPSC Essay '+lesson.year:'Original practice · not a PYQ'}</span></div><details className="essay-section-menu"><summary>Jump to a lesson section</summary><nav aria-label="Lesson sections">{sections.map(section=><button key={section.id} onClick={()=>onJump(section.id)}>{section.title}<ChevronRight size={14}/></button>)}</nav></details><div className="essay-neighbours"><button disabled={!previous} onClick={()=>previous&&onOpen(essayTopics.find(topic=>topic.id===essayLessonId(previous.day))!)}><ArrowLeft size={14}/>{previous?'Day '+previous.day:'First available lesson'}</button><button disabled={!next} onClick={()=>next&&onOpen(essayTopics.find(topic=>topic.id===essayLessonId(next.day))!)}>{next?'Day '+next.day:'Last day in this archive'}<ChevronRight size={14}/></button></div></div>;
}

export function EssayQuestionSource({topicId}:{topicId:string}){
 const lesson=lessonForTopic(topicId);
 if(!lesson)return null;
 return <section className="essay-question-source"><span className="pill">{lesson.questionType==='pyq'?'UPSC ESSAY '+lesson.year:'ORIGINAL PRACTICE · NOT A PYQ'}</span><h2>{lesson.topic}</h2><p>{lesson.questionType==='pyq'?'The question wording and year were verified in the original chat lesson. This archive retains that attribution and links its sources; it does not claim a fresh original-paper verification.':'This topic was written for practice. It must not be cited as a UPSC previous-year question.'}</p><div>{lesson.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}<ArrowUpRight size={14}/></a>)}</div></section>;
}
