import {z} from 'zod';
const id=z.string().min(1).max(120);
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s=>{const d=new Date(s+'T12:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s;},'Invalid date');
const annotation=z.object({id,topicId:id,blockId:id.optional(),quote:z.string().max(30000).optional(),start:z.number().int().nonnegative().optional(),end:z.number().int().nonnegative().optional(),color:z.enum(['yellow','green','pink','blue']),tags:z.array(z.string().max(100)).max(40),note:z.string().max(30000),due:date,step:z.number().int().min(0).max(4),type:z.enum(['highlight','bookmark','note'])}).refine(a=>a.type!=='note'||a.note.trim().length>0,'Write a personal note').refine(a=>a.type!=='highlight'||(a.blockId&&a.quote&&a.start!==undefined&&a.end!==undefined&&a.end>a.start),'Highlight requires a passage');
const topic=z.object({id,title:z.string().min(1).max(500),paper:z.enum(['GS1','GS2','GS3','GS4','Essay']),subject:z.string().min(1).max(500),description:z.string().max(1000),blocks:z.array(z.object({id,text:z.string().max(100000),heading:z.boolean().optional()})).min(1).max(1500),source:z.string().max(1000).optional(),sourceUrl:z.string().url().refine(s=>/^https?:\/\//.test(s)).optional(),verification:z.string().max(2000).optional()});
export const recordSchema=z.discriminatedUnion('kind',[
 z.object({id,kind:z.literal('annotation'),payload:annotation}),
 z.object({id,kind:z.literal('topic'),payload:topic}),
 z.object({id,kind:z.literal('attempt'),payload:z.record(z.string(),z.unknown())}),
]).refine(r=>r.kind==='attempt'||r.id===r.payload.id,'Record identifiers must match');
