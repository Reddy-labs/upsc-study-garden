import course from '@/data/essay-course.json';
import day09 from '@/data/essays/day-09.json';
import day10 from '@/data/essays/day-10.json';
import day11 from '@/data/essays/day-11.json';
import day12 from '@/data/essays/day-12.json';
import day13 from '@/data/essays/day-13.json';
import day14 from '@/data/essays/day-14.json';
import day17 from '@/data/essays/day-17.json';
import day18 from '@/data/essays/day-18.json';
import day19 from '@/data/essays/day-19.json';

export type LessonSection = {id:string;title:string;paragraphs:string[]};
export type LessonSource = {label:string;url:string};
export type EssayLesson = {
 day:number;topic:string;questionType:'pyq'|'practice';year?:number;
 framework:string;thesis:string;concept:string;mechanism:string;example:string;boundary:string;
 anchors:string[];recallQuestions:{question:string;answer:string}[];
 sections:LessonSection[];essay:string[];writePrompt:string;sources:LessonSource[];
 recallCard?:string;dailyRoutine?:string;
};
export type CourseEntry = {day:number;title:string;conceptId:string;conceptTitle:string;status:'imported'|'awaiting-original'};
export const essayCourse = course as CourseEntry[];
export const essayLessons = [day09,day10,day11,day12,day13,day14,day17,day18,day19] as EssayLesson[];
export const essayLessonId = (day:number) => 'essay-day-'+String(day).padStart(2,'0');
export const lessonForTopic = (id:string) => essayLessons.find(lesson=>essayLessonId(lesson.day)===id);

export function lessonBlocks(lesson:EssayLesson){
 const blocks:{id:string;text:string;heading?:boolean}[]=[
  {id:'archive-context',text:'Day '+lesson.day+' · Imported from the lesson shared in chat. Original lesson content is retained; formatting is adapted for highlighting. No completion or prior recall performance is assumed.'}
 ];
 for(const section of lesson.sections){
  blocks.push({id:section.id+'-heading',text:section.title,heading:true});
  section.paragraphs.forEach((text,i)=>blocks.push({id:section.id+'-'+i,text}));
 }
 blocks.push({id:'model-essay-heading',text:'Model essay — '+lesson.topic,heading:true});
 lesson.essay.forEach((text,i)=>blocks.push({id:'essay-paragraph-'+String(i+1).padStart(2,'0'),text}));
 blocks.push({id:'recall-card-heading',text:'Recall card',heading:true});
 blocks.push({id:'recall-card',text:lesson.recallCard??('Meaning: '+lesson.concept+'\nMechanism: '+lesson.mechanism+'\nExample: '+lesson.example+'\nLimit: '+lesson.boundary+'\nSynthesis: '+lesson.thesis)});
 blocks.push({id:'daily-routine-heading',text:'Your 30–35-minute routine',heading:true});
 blocks.push({id:'daily-routine',text:lesson.dailyRoutine??'Recall — 5 minutes: answer the two older-card questions before looking at their answers.\nNew concept — 5 minutes: explain the concept, example and boundary in your own words.\nRead — 10–15 minutes: close the essay and reconstruct its thesis in two sentences.\nWrite — 10 minutes: write 120–150 words on the prompt below.'});
 blocks.push({id:'write-prompt',text:lesson.writePrompt+'\n\nUse claim → mechanism → example → limit → synthesis. These are self-review exercises, not automated marking.'});
 blocks.push({id:'source-links-heading',text:'Evidence and source links',heading:true});
 lesson.sources.forEach((source,i)=>blocks.push({id:'source-'+i,text:source.label+'\n'+source.url}));
 return blocks;
}

export const essayTopics = essayLessons.map(lesson=>({
 id:essayLessonId(lesson.day),title:'Day '+lesson.day+' — '+essayCourse.find(entry=>entry.day===lesson.day)!.title,
 paper:'Essay',subject:'Daily essay preparation',description:lesson.topic,blocks:lessonBlocks(lesson),
 source:'Daily Essay Mentor · Day '+lesson.day+' · imported chat lesson',
 verification:lesson.questionType==='practice'?'Original practice topic, not a UPSC PYQ. Imported from the available chat lesson.':'UPSC Essay '+lesson.year+' topic, as verified in the original chat lesson. A paper transcription is linked below; this import does not claim a new original-paper verification.'
}));

export const essayRevisionCards = Object.fromEntries(essayLessons.map(lesson=>[essayLessonId(lesson.day),{
 keywords:[essayCourse.find(entry=>entry.day===lesson.day)!.conceptId,essayCourse.find(entry=>entry.day===lesson.day)!.conceptTitle,lesson.framework,'Mechanism','Evidence','Boundary'],
 chain:lesson.mechanism,
 points:[{label:'New concept',text:lesson.concept},{label:'Thesis',text:lesson.thesis},{label:'Example',text:lesson.example},{label:'Boundary',text:lesson.boundary},{label:'Writing exercise',text:lesson.writePrompt}],
 recall:['Reconstruct the thesis in two sentences.',...lesson.recallQuestions.map(q=>q.question),'What is the boundary of today’s concept?']
}]));
