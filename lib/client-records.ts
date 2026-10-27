import {recordSchema} from './study-record';
export type StudyRecord={id:string;kind:'annotation'|'topic'|'attempt';payload:Record<string,unknown>};
export const DATABASE_NAME='study-garden';
let opened:Promise<IDBDatabase>|null=null;
function database(){
 if(typeof indexedDB==='undefined')return Promise.reject(new Error('This browser does not allow saved study data. Enable browser storage to save your work.'));
 if(!opened)opened=new Promise<IDBDatabase>((resolve,reject)=>{
  const request=indexedDB.open(DATABASE_NAME,1);
  request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('records'))request.result.createObjectStore('records',{keyPath:'id'});};
  request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();opened=null;};resolve(db);};
  request.onerror=()=>{opened=null;reject(new Error('Your study data could not be opened. Please retry.'));};
  request.onblocked=()=>{opened=null;reject(new Error('Close other Study Garden tabs, then retry.'));};
 });
 return opened;
}
export async function readRecords():Promise<StudyRecord[]>{const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('records','readonly');const request=tx.objectStore('records').getAll();request.onsuccess=()=>{const rows=request.result;if(rows.some(r=>!recordSchema.safeParse(r).success)){reject(new Error('Some saved data could not be read safely. Export a backup before resetting this browser.'));return;}resolve(rows);};request.onerror=()=>reject(new Error('Your study data could not be read.'));});}
export async function saveRecord(record:StudyRecord){const parsed=recordSchema.safeParse(record);if(!parsed.success)throw new Error('This study item is incomplete. Check the note, tags and revision date.');const db=await database();return new Promise<void>((resolve,reject)=>{const tx=db.transaction('records','readwrite');tx.objectStore('records').put(parsed.data);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(new Error('Could not save on this device. Export a backup and check available browser storage.'));tx.onabort=()=>reject(new Error('The save was interrupted. Your draft is still open; please retry.'));});}
export async function deleteRecord(id:string){const db=await database();return new Promise<void>((resolve,reject)=>{const tx=db.transaction('records','readwrite');tx.objectStore('records').delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(new Error('Could not remove the item. Please retry.'));});}
