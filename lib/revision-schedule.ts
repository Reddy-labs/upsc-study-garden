export function dateIn(days=0,now=new Date()){
 const today=now.toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'});
 const d=new Date(today+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);
}
export function reviewSchedule(step:number,remember:boolean,now=new Date()){
 const next=remember?Math.min(step+1,4):0;
 return {step:next,due:dateIn(remember?[1,3,7,14,30][next]:1,now)};
}
