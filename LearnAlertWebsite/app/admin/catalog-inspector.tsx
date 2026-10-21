'use client';
import { useState } from 'react';
import { fieldChoices, friendly, templateFor, type JSONObject, type JSONValue } from './catalog-model';

const childCollections = new Set(['units','lessons','cards','questions','guideTopics']);
const longText = /question|answer|hint|rule|summary|description|explanation|note|example|prompt|meaning/i;

export function JSONInspector({ value, onChange, label = 'Entry', structural = true }: { value: JSONValue; onChange: (value: JSONValue) => void; label?: string; structural?: boolean }) {
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('text');
  if (value === null) return <button type="button" onClick={() => onChange('')}>Set {label}</button>;
  if (Array.isArray(value)) return <div className="catalog-array">
    {value.map((item, index) => <div className="catalog-array-item" key={index}><span className="catalog-index">{index + 1}</span><div><JSONInspector value={item} label={`${label} ${index + 1}`} onChange={next => onChange(value.map((old, i) => index === i ? next : old))} structural={false} /></div><div className="catalog-array-actions"><button type="button" title="Move up" aria-label={`Move ${label} ${index + 1} up`} disabled={!index} onClick={() => { const next = [...value]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange(next); }}>↑</button><button type="button" title="Remove" aria-label={`Remove ${label} ${index + 1}`} onClick={() => onChange(value.filter((_, i) => index !== i))}>×</button></div></div>)}
    <button type="button" className="catalog-add-inline" onClick={() => onChange([...value, value.length && typeof value[0] === 'object' ? {} : ''])}>＋ Add {label.toLowerCase()}</button>
  </div>;
  if (typeof value !== 'object') {
    if (typeof value === 'boolean') return <input type="checkbox" aria-label={label} checked={value} onChange={e => onChange(e.target.checked)} />;
    if (typeof value === 'number') return <input aria-label={label} type="number" step="any" value={value} onChange={e => { if (e.target.value !== '') onChange(Number(e.target.value)); }} />;
    const choices = fieldChoices[label];
    if (choices) return <select aria-label={friendly(label)} value={value} onChange={e => onChange(e.target.value)}>{[...new Set([...choices, value])].map(option => <option key={option} value={option}>{friendly(option)}</option>)}</select>;
    return longText.test(label) || value.includes('\n') || value.length > 100 ? <textarea aria-label={friendly(label)} value={value} rows={Math.min(6, Math.max(2, value.split('\n').length))} onChange={e => onChange(e.target.value)} /> : <input aria-label={friendly(label)} value={value} onChange={e => onChange(e.target.value)} />;
  }
  const object = value as JSONObject;
  const keys = Object.keys(object);
  const patch = (key: string, next: JSONValue) => onChange({ ...object, [key]: next });
  function addField() {
    const key = fieldName.trim();
    if (!key || Object.hasOwn(object, key) || ['__proto__','prototype','constructor'].includes(key)) return;
    patch(key, fieldType === 'object' ? {} : fieldType === 'array' ? [] : fieldType === 'number' ? 0 : fieldType === 'boolean' ? false : '');
    setFieldName('');
  }
  return <div className="catalog-fields">
    {keys.map(key => {
      const item = object[key];
      const collection = structural && childCollections.has(key) && Array.isArray(item);
      const nested = item !== null && typeof item === 'object';
      return <div className={`catalog-field ${nested ? 'catalog-field-wide' : ''}`} key={key}>
        <div className="catalog-field-label"><label>{friendly(key)}</label><button type="button" className="catalog-remove-field" title={`Remove ${key}`} aria-label={`Remove ${key}`} onClick={() => onChange(Object.fromEntries(Object.entries(object).filter(([name]) => name !== key)))}>×</button></div>
        {collection ? <div className="catalog-collection-summary">{(item as JSONValue[]).length} {friendly(key).toLowerCase()} <span>· Select an item in the outline to edit</span></div> : nested ? <details open={['activity','vocabularyItem'].includes(key)}><summary>{Array.isArray(item) ? `${item.length} items` : `${Object.keys(item).length} fields`}</summary><JSONInspector value={item} label={key} onChange={next => patch(key, next)} structural={false} /></details> : <JSONInspector value={item} label={key} onChange={next => patch(key, next)} structural={false} />}
      </div>;
    })}
    <div className="catalog-add-field catalog-field-wide"><input aria-label="New field name" value={fieldName} onChange={e => setFieldName(e.target.value)} placeholder="Add a field by name…" /><select aria-label="New field type" value={fieldType} onChange={e => setFieldType(e.target.value)}>{['text','number','boolean','array','object'].map(type => <option key={type}>{type}</option>)}</select><button type="button" disabled={!fieldName.trim() || Object.hasOwn(object, fieldName.trim())} onClick={addField}>＋ Field</button></div>
  </div>;
}

export function OptionalCardFields({ value, onChange }: { value: JSONObject; onChange: (value: JSONObject) => void }) {
  const optional: Record<string, JSONValue> = {
    activity: templateFor('activity'), vocabularyItem: templateFor('vocabularyItem'), grammarNote: '', speechText: '', conceptTag: '', explanation: '', acceptedAnswers: [], readingPrompt: '', previousQuestion: '', promptImageName: '', optionImageNames: [], promptAudioName: '', answerImageName: '', fieldMedia: {}, correctOptionIndex: 0,
  };
  if (!('cardType' in value)) return null;
  return <div className="catalog-optional-fields"><span>Add to card</span><select aria-label="Add optional card field" value="" onChange={e => { if (e.target.value) onChange({ ...value, [e.target.value]: optional[e.target.value] }); }}><option value="">Choose field…</option>{Object.keys(optional).filter(key => !(key in value)).map(key => <option key={key} value={key}>{friendly(key)}</option>)}</select></div>;
}
