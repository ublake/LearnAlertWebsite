export type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };
export type JSONObject = { [key: string]: JSONValue };
export type NodePath = (string | number)[];
export type CatalogKind = 'course' | 'exam';
export type CatalogDelivery = { profile: string; revision: number; sourceRevision: number; state: string; digest: string; title: string; activatedAt?: number | null };
export type CatalogRecord = { id: string; kind: CatalogKind; status: string; revision: number; sortOrder?: number; publishedRevision?: number | null; updatedAt?: number; publishedAt?: number; document: JSONObject; deliveries?: CatalogDelivery[] };
export type CatalogSummary = Omit<CatalogRecord, 'document'> & { title?: string; name?: string; unitCount?: number; lessonCount?: number; cardCount?: number };

export function atPath(value: JSONValue, path: NodePath): JSONValue {
  return path.reduce<JSONValue>((item, key) => item != null && typeof item === 'object' ? (item as JSONObject)[key] : null, value);
}
export function replaceAt(value: JSONValue, path: NodePath, next: JSONValue): JSONValue {
  if (!path.length) return next;
  const [key, ...rest] = path;
  if (value == null || typeof value !== 'object') throw new Error('This item no longer exists. Select it again.');
  const copy = Array.isArray(value) ? [...value] : { ...value };
  (copy as JSONObject)[key] = replaceAt((value as JSONObject)[key], rest, next);
  return copy;
}
export function removeAt(value: JSONValue, path: NodePath): JSONValue {
  if (!path.length) throw new Error('Delete the whole entry from its menu.');
  const parent = atPath(value, path.slice(0, -1));
  const key = path.at(-1)!;
  if (parent == null || typeof parent !== 'object') return value;
  const copy = Array.isArray(parent) ? parent.filter((_, i) => i !== key) : Object.fromEntries(Object.entries(parent).filter(([name]) => name !== key));
  return replaceAt(value, path.slice(0, -1), copy);
}
export function newID(prefix: string) { return `${prefix}-${crypto.randomUUID().slice(0, 12)}`; }
export function duplicateNode(value: JSONValue): JSONValue {
  return value && typeof value === 'object' && !Array.isArray(value) ? duplicateDocument(value as JSONObject) : Array.isArray(value) ? value.map(duplicateNode) : value;
}
export function duplicateDocument(document: JSONObject): JSONObject {
  const idMap = new Map<string, string>();
  const copy = (value: JSONValue): JSONValue => {
    if (Array.isArray(value)) return value.map(copy);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.entries(value).map(([key, item]) => {
      if (key === 'exercise') return [key, structuredClone(item)];
      if (key !== 'id' || typeof item !== 'string') return [key, copy(item)];
      const id = newID(item.split('-')[0] || 'copy'); idMap.set(item, id); return [key, id];
    }));
  };
  const next = copy(document) as JSONObject;
  for (const field of ['guides', 'guidePresentation']) {
    const map = next[field];
    if (map && typeof map === 'object' && !Array.isArray(map)) next[field] = Object.fromEntries(Object.entries(map).map(([key, value]) => [idMap.get(key) || key, value]));
  }
  const remap = (value: JSONValue): JSONValue => {
    if (Array.isArray(value)) return value.map(remap);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.entries(value).map(([key,item]) => {
      if (key === 'exercise' && item && typeof item === 'object' && !Array.isArray(item)) {
        const exercise = structuredClone(item) as JSONObject;
        if (Array.isArray(exercise.prerequisiteIDs)) exercise.prerequisiteIDs = exercise.prerequisiteIDs.map(id => typeof id === 'string' ? idMap.get(id) || id : id);
        return [key,exercise];
      }
      if (['lessonIDs','remediationLessonIDs'].includes(key) && Array.isArray(item)) return [key,item.map(id=>typeof id === 'string' ? idMap.get(id) || id : id)];
      return [key,remap(item)];
    }));
  };
  return remap(next) as JSONObject;
}
export function blankCard(course = true): JSONObject {
  return { id: newID('card'), question: '', options: [], correctAnswer: '', hint: '', cardType: course ? 'multipleChoice' : 'multiple_choice', matchingLeftItems: [], matchingRightItems: [], optionImageNames: [], ...(course ? {} : { fieldMedia: {}, sectionName: '' }) };
}
export function templateFor(field: string): JSONObject {
  if (field === 'units') return { id: newID('unit'), unitNumber: 1, title: 'New unit', subtitle: '', colorHex: '#75B9DA', badgeIcon: 'book.fill', lessons: [] };
  if (field === 'lessons') return { id: newID('lesson'), lessonNumber: 1, title: 'New lesson', subtitle: '', nodeType: 'lesson', estimatedMinutes: 5, tipNote: '', cards: [] };
  if (field === 'checkpointQuiz') return { id: newID('checkpoint'), title: 'Checkpoint', summary: '', passingScoreThreshold: 0.8, questions: [], keyConcepts: [] };
  if (field === 'guideTopics') return { title: 'New guide', rule: '', examples: [] };
  if (field === 'guidePresentation') return { showsHangulDiagram: false };
  if (field === 'activity') return { kind: 'teach', sequence: 1, rule: '', example: '', symbol: '', layout: 'inline', tokens: [], slots: [], slotLabels: [], optionHints: {}, readingCue: '', practiceGroup: '' };
  if (field === 'vocabularyItem') return { surface: '', dictionaryForm: '', romanization: '', partOfSpeech: '', contextualMeaning: '', breakdownNote: '', exampleKorean: '', exampleEnglish: '', audioText: '' };
  return blankCard();
}
export function blankDocument(kind: CatalogKind): JSONObject {
  return kind === 'course' ? { id: newID('course'), title: 'Untitled course', language: '', flagEmoji: '🌱', levelTag: 'Beginner', colorHex: '#75B9DA', summary: '', estimatedHours: 1, outcomes: [], units: [], guides: {}, guidePresentation: {} } : { id: newID('exam'), name: 'Untitled exam deck', category: 'Exam Prep', subcategory: '', description: '', colorHex: '#75B9DA', deckType: 'Mixed', cards: [] };
}
export type TreeNode = { path: NodePath; label: string; type: string; detail?: string; children: TreeNode[] };
export function documentTree(document: JSONObject, kind: CatalogKind): TreeNode {
  const node = (value: JSONObject, path: NodePath, type: string, fallback: string): TreeNode => {
    const children: TreeNode[] = [];
    for (const [key, childType] of [['units','Unit'], ['lessons','Lesson'], ['cards','Card'], ['questions','Question'], ['guideTopics','Guide']] as const) {
      const values = value[key];
      if (Array.isArray(values)) values.forEach((item, index) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) children.push(node(item, [...path, key, index], childType, `${childType} ${index + 1}`));
      });
    }
    if (type === 'Unit' && typeof value.id === 'string') {
      const guideMap = document.guides as JSONObject | undefined;
      const topics = guideMap?.[value.id];
      if (Array.isArray(topics)) topics.forEach((topic, index) => { if (topic && typeof topic === 'object' && !Array.isArray(topic)) children.push(node(topic, ['guides', value.id as string, index], 'Guide', `Guide ${index + 1}`)); });
      const presentations = document.guidePresentation as JSONObject | undefined;
      const presentation = presentations?.[value.id];
      if (presentation && typeof presentation === 'object' && !Array.isArray(presentation)) children.push({ path: ['guidePresentation', value.id], label: 'Guide display & reference', type: 'Guide display', children: [] });
    }
    if (value.checkpointQuiz && typeof value.checkpointQuiz === 'object' && !Array.isArray(value.checkpointQuiz)) children.push(node(value.checkpointQuiz, [...path, 'checkpointQuiz'], 'Checkpoint', 'Checkpoint'));
    return { path, label: String(value.title || value.name || value.question || value.surface || fallback).slice(0, 100), type, detail: typeof value.cardType === 'string' ? value.cardType : undefined, children };
  };
  return node(document, [], kind === 'course' ? 'Course' : 'Exam deck', 'Untitled');
}
export function countDocument(document: JSONObject) {
  let units = 0, lessons = 0, cards = 0, guides = 0;
  const visit = (value: JSONValue) => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(visit); return; }
    for (const [key, item] of Object.entries(value)) {
      if (Array.isArray(item)) {
        if (key === 'units') units += item.length;
        if (key === 'lessons') lessons += item.length;
        if (key === 'cards' || key === 'questions') cards += item.length;
        if (key === 'guideTopics') guides += item.length;
      }
      visit(item);
    }
  };
  visit(document);
  if (document.guides && typeof document.guides === 'object' && !Array.isArray(document.guides)) guides += Object.values(document.guides).reduce<number>((sum, value) => sum + (Array.isArray(value) ? value.length : 0), 0);
  return { units, lessons, cards, guides };
}
export const friendly = (key: string) => key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
export const fieldChoices: Record<string, string[]> = {
  nodeType: ['lesson','practice','checkpoint','cultural_tip'],
  cardType: ['multipleChoice','tapReveal','fillBlank','matching','vocabulary','listening','listeningWrite','hangulTrace','hangulBuild','tokenPlacement','images','multiple_choice','tap_reveal','fill_blank'],
  kind: ['teach','trace','buildBlock','placeTokens','listenChoose','situation','matchPairs'],
  layout: ['inline','beside','below','besideWithFinal','belowWithFinal'],
};

export function legacyPublicationBlocked(record: CatalogRecord, document: JSONObject): boolean {
  const learning = document.learning;
  return (record.id === 'spanish-course' && record.publishedRevision != null) || !!record.deliveries?.some(x => x.profile === 'practice-v1') || !!(learning && typeof learning === 'object' && !Array.isArray(learning) && learning.starter);
}
export function deliveryRequest(record: CatalogRecord, operation: string, additions?: JSONValue, deliveryRevision?: number): JSONObject {
  if (record.kind !== 'course' || !['prepare','activate','rollback','withdraw','restoreApproved'].includes(operation)) throw new Error('Choose an explicit course delivery action.');
  if (operation !== 'restoreApproved' && (!record.publishedRevision || record.status !== 'published')) throw new Error('A published legacy source is required.');
  const body: JSONObject = {operation, profile:'practice-v1', expectedRevision:record.revision};
  if (operation === 'prepare') {
    if (!additions || typeof additions !== 'object' || Array.isArray(additions) || !Array.isArray(additions.units) || !additions.units.length || !additions.learning || Object.keys(additions).some(key => !['units','learning'].includes(key))) throw new Error('Provide only new units and learning metadata. The saved draft is not a release source.');
    body.sourceRevision = record.publishedRevision!; body.additions = additions;
  }
  if (operation === 'activate' || operation === 'rollback') {
    const selected = record.deliveries?.find(x=>x.profile === 'practice-v1' && x.revision === deliveryRevision);
    if (!selected || (operation === 'rollback' && !selected.activatedAt)) throw new Error('Select a reviewed candidate or a previously activated rollback revision.');
    body.deliveryRevision = selected.revision;
  }
  return body;
}
