'use client';
import { useEffect, useRef, useState } from 'react';
import { uploadCatalogMedia } from './admin-client';
import { type JSONObject, type JSONValue } from './catalog-model';

const list = (value: JSONValue | undefined) => Array.isArray(value) ? value : [];
const obj = (value: JSONValue | undefined): JSONObject => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const text = (value: JSONValue | undefined) => typeof value === 'string' ? value : '';
const cardTypes = [['multipleChoice','Quiz'],['matching','Match pairs'],['fillBlank','Fill in the blank'],['vocabulary','Vocabulary'],['tapReveal','Tap to reveal'],['images','Images']] as const;
const nativeType = (value: JSONValue | undefined) => (({multiple_choice:'multipleChoice',fill_blank:'fillBlank',tap_reveal:'tapReveal'} as Record<string,string>)[text(value)] || text(value));

/** Move old attachment aliases into the native field map before changing media. */
function withFieldMedia(source: JSONObject): JSONObject {
  const fields: JSONObject = Object.fromEntries(Object.entries(obj(source.fieldMedia)).map(([key,value])=>{const media={...obj(value)};if(media.image==null&&media.imageID)media.image=media.imageID;if(media.audio==null&&media.audioID)media.audio=media.audioID;delete media.imageID;delete media.audioID;return [key,media];}));
  function attach(key: string, kind: string, value: JSONValue | undefined) {
    if (typeof value !== 'string') return;
    const media = {...obj(fields[key])};
    if (value) media[kind] = value; else delete media[kind];
    if (Object.keys(media).length) fields[key] = media; else delete fields[key];
  }
  attach('prompt','image',source.promptImageName); attach('prompt','audio',source.promptAudioName);
  attach('answer','image',source.answerImageName);
  list(source.optionImageNames).forEach((value,index)=>{if(typeof value === 'string' && value.length)attach(`option:${index}`,'image',value);});
  const next: JSONObject = {...source,fieldMedia:fields};
  for (const key of ['promptImageName','promptAudioName','answerImageName','optionImageNames']) delete next[key];
  return next;
}

export function SimpleLanguageFields({value, onChange, catalogID}: {value: JSONObject; onChange: (value: JSONObject) => void; catalogID: string}) {
  const latest = useRef(value); latest.current = value;
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const initial = withFieldMedia(value);
  const [hintEnabled,setHintEnabled] = useState(Boolean(text(value.hint) || Object.values(obj(obj(initial.fieldMedia).hint)).some(Boolean)));
  const [uploading,setUploading] = useState('');
  const [error,setError] = useState('');
  const patch = (key: string, next: JSONValue) => onChange({...latest.current,[key]:next});
  const field = (key: string, title: string) => <label className="simple-field">{title}<input value={text(value[key])} onChange={e=>patch(key,e.target.value)} /></label>;
  function setMedia(key: string, kind: 'image'|'audio', reference?: string) {
    if (!mounted.current) return;
    const next = withFieldMedia(latest.current), fields = {...obj(next.fieldMedia)}, media = {...obj(fields[key])};
    if (reference) media[kind] = reference; else delete media[kind];
    if (Object.keys(media).length) fields[key] = media; else delete fields[key];
    onChange({...next,fieldMedia:fields});
  }
  const mediaField = (key: string, title: string, valueText: string, set: (value: string) => void, imageOnly = false) => {
    const media = obj(obj(initial.fieldMedia)[key]);
    const url = (name: JSONValue | undefined) => typeof name === 'string' && /^catalog:[a-f0-9-]{36}$/i.test(name) ? `/admin/api/catalog/media/${name.slice(8)}` : null;
    return <div className="simple-media-field"><label>{title}{!imageOnly && <textarea rows={1} placeholder="Text, image or audio" value={valueText} onChange={e=>set(e.target.value)} />}</label><div className="actions">{(imageOnly ? ['image'] as const : ['image','audio'] as const).map(type=><label key={type} className="admin-upload-button">{type === 'image' ? '▧ Image' : '♪ Audio'}<input aria-label={`Upload ${title} ${type}`} type="file" disabled={Boolean(uploading)} accept={type === 'image' ? '.png,.jpg,.jpeg' : '.mp3,.m4a,.wav'} onChange={async e=>{ const file=e.target.files?.[0];e.target.value='';if(!file)return;setUploading(`${title} ${type}`);setError('');try {setMedia(key,type,await uploadCatalogMedia(catalogID,file));} catch(error) {if(mounted.current)setError((error as Error).message);} finally {if(mounted.current)setUploading('');} }} /></label>)}{(['image','audio'] as const).filter(type=>media[type]).map(type=><button type="button" key={type} disabled={Boolean(uploading)} onClick={()=>setMedia(key,type)} aria-label={`Remove ${title} ${type}`}>× {type}</button>)}</div>{media.image && <div className="simple-attachment-preview">{url(media.image) ? <img src={url(media.image)!} alt={`${title} image`} /> : <code>{text(media.image)}</code>}</div>}{media.audio && <div className="simple-attachment-preview">{url(media.audio) ? <audio controls preload="none" aria-label={`${title} audio`} src={url(media.audio)!} /> : <code>{text(media.audio)}</code>}</div>}</div>;
  };
  if (!value.cardType) return <div className="catalog-fields">
    {field('title', Array.isArray(value.units) ? 'Language' : Array.isArray(value.lessons) ? 'Deck group' : 'Topic deck')}
    {Array.isArray(value.units) && <>{field('language','Language name')}<label className="simple-field">Color<input type="color" value={text(value.colorHex) || '#75b9da'} onChange={e=>patch('colorHex',e.target.value)}/></label><details className="simple-display-details"><summary>Display details</summary>{field('flagEmoji','Language marker')}</details></>}
    <p className="catalog-collection-summary">{Array.isArray(value.units) ? 'Independent topic decks. The first four appear in Recommended decks; the rest use their deck groups.' : Array.isArray(value.lessons) ? 'A display group for topic decks. Learners can choose any deck.' : `${list(value.cards).length} cards · saved and studied as an ordinary deck.`}</p>
  </div>;
  const type = nativeType(value.cardType), options = list(value.options).map(v=>text(v));
  const choices = type === 'multipleChoice' || type === 'fillBlank' && options.length > 0;
  const changeType = (type: string) => {
    const next = withFieldMedia(value), fields = obj(next.fieldMedia);
    const retained = Object.fromEntries(Object.entries(fields).filter(([key])=>['prompt','hint'].includes(key) || ['answer'].includes(key) && !['multipleChoice','matching'].includes(type)));
    if (type === 'images') {
      const imageFields = Object.fromEntries(['prompt','answer'].flatMap(key=>text(obj(fields[key]).image) ? [[key,{image:obj(fields[key]).image}]] : []));
      onChange({...next,cardType:type,question:'',correctAnswer:'',hint:'',options:[],correctOptionIndex:null,matchingLeftItems:[],matchingRightItems:[],fieldMedia:imageFields});setHintEnabled(false);return;
    }
    onChange({...next,cardType:type,options:type==='multipleChoice'?['','','','']:[],correctOptionIndex:type==='multipleChoice'?0:null,matchingLeftItems:type==='matching'?['','']:[],matchingRightItems:type==='matching'?['','']:[],fieldMedia:retained});
  };
  const resize = (count: number) => {
    const next = withFieldMedia(value), fields = Object.fromEntries(Object.entries(obj(next.fieldMedia)).filter(([key])=>!key.startsWith('option:') || Number(key.slice(7)) < count));
    const index = Math.min(Number(value.correctOptionIndex || 0),count-1), updated = Array.from({length:count},(_,i)=>options[i] || '');
    onChange({...next,options:updated,correctOptionIndex:index,correctAnswer:updated[index],fieldMedia:fields});
  };
  return <div className="simple-card-fields">
    {error && <p role="alert" className="admin-error">{error}</p>}{uploading && <p role="status">Uploading {uploading}…</p>}
    <label>Card type<select value={type} disabled={Boolean(uploading)} onChange={e=>changeType(e.target.value)}>{!cardTypes.some(([id])=>id===type) && <option value={type}>{type} · legacy</option>}{cardTypes.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
    {mediaField('prompt',type==='images'?'Front image':type==='fillBlank'?'Sentence with ___':'Prompt',text(value.question),v=>patch('question',v),type==='images')}
    {type === 'fillBlank' && <label className="admin-hint-toggle"><input type="checkbox" checked={options.length>0} onChange={e=>{const next=withFieldMedia(value),fields=Object.fromEntries(Object.entries(obj(next.fieldMedia)).filter(([key])=>!key.startsWith('option:')));onChange({...next,options:e.target.checked?[text(value.correctAnswer),'','','']:[],correctOptionIndex:e.target.checked?0:null,fieldMedia:fields});}}/>Use answer choices</label>}
    {choices ? <><label>Choices<select value={options.length} onChange={e=>resize(Number(e.target.value))}>{[2,3,4].map(n=><option key={n}>{n}</option>)}</select></label>{options.map((option,i)=><div className="admin-choice-field" key={i}><input type="radio" name={`correct-${value.id}`} checked={Number(value.correctOptionIndex || 0)===i} aria-label={`Choice ${i+1} is correct`} onChange={()=>onChange({...value,correctOptionIndex:i,correctAnswer:options[i]})}/>{mediaField(`option:${i}`,`Choice ${i+1}`,option,v=>{const next=[...options];next[i]=v;onChange({...value,options:next,...(Number(value.correctOptionIndex || 0)===i?{correctAnswer:v}:{})});})}</div>)}</> : type==='matching' ? <>{list(value.matchingLeftItems).map((_,i)=><div className="admin-editor-grid" key={i}>{(['matchingLeftItems','matchingRightItems'] as const).map(side=><div key={side}>{mediaField(`${side==='matchingLeftItems'?'left':'right'}:${i}`,side==='matchingLeftItems'?'Item':'Match',text(list(value[side])[i]),v=>{const next=[...list(value[side])];next[i]=v;patch(side,next);})}</div>)}<button type="button" aria-label={`Remove pair ${i+1}`} disabled={list(value.matchingLeftItems).length<=2} onClick={()=>{const next=withFieldMedia(value),fields:JSONObject={};for(const [key,item]of Object.entries(obj(next.fieldMedia))){const match=/^(left|right):(\d+)$/.exec(key);if(!match){fields[key]=item;continue;}const index=Number(match[2]);if(index!==i)fields[`${match[1]}:${index>i?index-1:index}`]=item;}onChange({...next,matchingLeftItems:list(value.matchingLeftItems).filter((_,index)=>index!==i),matchingRightItems:list(value.matchingRightItems).filter((_,index)=>index!==i),fieldMedia:fields});}}>× Pair</button></div>)}<button type="button" disabled={list(value.matchingLeftItems).length>=20} onClick={()=>onChange({...value,matchingLeftItems:[...list(value.matchingLeftItems),''],matchingRightItems:[...list(value.matchingRightItems),'']})}>＋ Pair</button></> : type === 'images' ? <>{mediaField('answer','Back image · optional','',()=>{},true)}<small>One image to review, or a front and back that flip when tapped.</small></> : mediaField('answer','Answer',text(value.correctAnswer),v=>patch('correctAnswer',v))}
    {type !== 'images' && <div className="simple-hint"><label className="admin-hint-toggle"><input type="checkbox" checked={hintEnabled} onChange={e=>{setHintEnabled(e.target.checked);if(!e.target.checked){const next=withFieldMedia(value),fields={...obj(next.fieldMedia)};delete fields.hint;onChange({...next,hint:'',fieldMedia:fields});}}}/>Hint</label>{hintEnabled && mediaField('hint','Hint',text(value.hint),v=>patch('hint',v))}</div>}
    <small className="simple-card-id">{text(value.id)}</small>
  </div>;
}
