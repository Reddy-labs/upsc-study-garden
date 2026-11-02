import data from '@/data/international-relations.json';
import revision from '@/data/ir-revision.json';

export type IRVisual=
 | {type:'table';headers:string[];rows:string[][]}
 | {type:'flow';steps:string[]}
 | {type:'mindmap';center:string;arms:string[]}
 | {type:'map';src:string;alt:string};
export type IRBlock={id:string;text:string;heading?:boolean;visual?:IRVisual};
export type IRTopic={id:string;title:string;paper:string;subject:string;theme:string;description:string;blocks:IRBlock[];source:string;sourceUrl:string;verification:string;guidePages:number[];sources:{label:string;url:string}[];recallPrompt:string};
export const irCourse=data;
export const irTopics=data.topics as IRTopic[];
export const irRevisionCards=revision;
const topicMap=new Map(irTopics.map(topic=>[topic.id,topic]));
export const irLessonForTopic=(id:string)=>topicMap.get(id);
export const irThemeForTopic=(id:string)=>irCourse.themes.find(theme=>theme.id===topicMap.get(id)?.theme);

