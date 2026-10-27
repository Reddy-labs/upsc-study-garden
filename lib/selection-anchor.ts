/** Accept a selection inside one reading block, including trailing paragraph separators. */
export function anchorSelection(blockText:string,rawText:string,start:number){
 if(!Number.isInteger(start)||start<0)return null;
 const quote=rawText.trim();if(!quote)return null;
 const position=start+rawText.length-rawText.trimStart().length;
 if(blockText.slice(position,position+quote.length)!==quote)return null;
 return {quote,start:position,end:position+quote.length};
}
