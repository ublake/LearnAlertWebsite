import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { atPath, replaceAt, removeAt, duplicateDocument, documentTree, countDocument, blankDocument, templateFor } from '../app/admin/catalog-model.ts';
const fixture = () => JSON.parse(fs.readFileSync(new URL('../public/admin-course-template.json', import.meta.url)));

test('nested edits keep stable IDs, preserve unknown fields, and do not mutate source', () => {
  const source = fixture(); source.futureSettings = { retained: ['yes'] };
  const edited = replaceAt(source, ['units', 0, 'lessons', 0, 'cards', 0, 'question'], 'Updated wording');
  assert.equal(atPath(edited, ['units', 0, 'lessons', 0, 'cards', 0, 'question']), 'Updated wording');
  assert.equal(source.units[0].lessons[0].cards[0].question, 'Which greeting means hello?');
  assert.equal(edited.units[0].lessons[0].cards[0].id, source.units[0].lessons[0].cards[0].id);
  assert.deepEqual(edited.futureSettings, { retained: ['yes'] });
});
test('duplicate courses give content fresh IDs and remap guide and presentation keys', () => {
  const source = fixture(), copy = duplicateDocument(source);
  assert.notEqual(copy.id, source.id);
  assert.notEqual(copy.units[0].id, source.units[0].id);
  assert.notEqual(copy.units[0].lessons[0].cards[0].id, source.units[0].lessons[0].cards[0].id);
  assert.deepEqual(copy.guides[copy.units[0].id], source.guides[source.units[0].id]);
  assert.ok(copy.guidePresentation[copy.units[0].id]);
  assert.equal(copy.guides[source.units[0].id], undefined);
});
test('outline exposes checkpoint questions and root-keyed unit guides at exact paths', () => {
  const source = fixture(), tree = documentTree(source, 'course'), unit = tree.children[0];
  const guide = unit.children.find(item => item.type === 'Guide');
  const checkpoint = unit.children.find(item => item.type === 'Checkpoint');
  assert.deepEqual(guide.path, ['guides', 'example-unit-1', 0]);
  assert.deepEqual(checkpoint.children[0].path, ['units', 0, 'checkpointQuiz', 'questions', 0]);
  assert.equal(atPath(source, guide.path).rule, source.guides['example-unit-1'][0].rule);
  assert.deepEqual(countDocument(source), { units: 1, lessons: 1, cards: 2, guides: 1 });
});
test('removing cards affects only the intended draft subtree', () => {
  const source = fixture(), edited = removeAt(source, ['units', 0, 'lessons', 0, 'cards', 0]);
  assert.equal(edited.units[0].lessons[0].cards.length, 0);
  assert.equal(edited.units[0].checkpointQuiz.questions.length, 1);
  assert.equal(source.units[0].lessons[0].cards.length, 1);
});
test('blank course and unit templates store guides at the root, never an unsupported unit property', () => {
  assert.deepEqual(blankDocument('course').guides, {});
  assert.deepEqual(blankDocument('course').guidePresentation, {});
  assert.equal(templateFor('units').guideTopics, undefined);
});


test('practice duplication preserves card-scoped choice identities and course-scoped lexical senses',()=>{
 const source=fixture();source.learning={vocabulary:{'es.libro.object':{lemma:'libro',meaning:'book',locale:'es-ES'}},concepts:{recognize:{title:'Recognize',prerequisiteIDs:[],vocabularyIDs:['es.libro.object']}}};
 source.units[0].lessons[0].cards[0].activity={kind:'situation',sequence:1,exercise:{format:'pictureChoice',vocabularyIDs:['es.libro.object'],conceptIDs:['recognize'],pictures:[{id:'book-choice',image:'catalog:uploaded-reference',description:'A book'}],correctChoiceID:'book-choice'}};
 const copy=duplicateDocument(source),exercise=copy.units[0].lessons[0].cards[0].activity.exercise;
 assert.equal(exercise.pictures[0].id,'book-choice');assert.equal(exercise.correctChoiceID,exercise.pictures[0].id);
 assert.deepEqual(exercise.vocabularyIDs,['es.libro.object']);assert.deepEqual(copy.learning,source.learning);
 assert.equal(source.units[0].lessons[0].cards[0].activity.exercise.correctChoiceID,'book-choice');
});

test('whole-course cloning remaps starter lesson/prerequisite links but retains stable concepts and pair identity',()=>{
 const source=fixture(),lesson=source.units[0].lessons[0],first=lesson.cards[0];
 const second={...structuredClone(first),id:'second-card'};lesson.cards.push(second);
 second.activity={kind:'situation',sequence:2,exercise:{format:'choice',prerequisiteIDs:[first.id],conceptIDs:['sense-stays'],vocabularyIDs:['lex-stays'],choices:[{id:'correct',text:'el libro'}],correctChoiceID:'correct'}};
 source.learning={vocabulary:{},concepts:{},starter:{id:'starter',revision:'pilot-1',lessonIDs:[lesson.id],assessment:{id:'check',lessonIDs:[lesson.id],forms:{a:[{card:{...first,id:'assessment-question'},objectiveID:'objective-stays',remediationLessonIDs:[lesson.id]}]}}}};
 const copy=duplicateDocument(source),nextLesson=copy.units[0].lessons[0];
 assert.deepEqual(nextLesson.cards[1].activity.exercise.prerequisiteIDs,[nextLesson.cards[0].id]);
 assert.deepEqual(copy.learning.starter.lessonIDs,[nextLesson.id]);assert.deepEqual(copy.learning.starter.assessment.lessonIDs,[nextLesson.id]);assert.deepEqual(copy.learning.starter.assessment.forms.a[0].remediationLessonIDs,[nextLesson.id]);
 assert.deepEqual(nextLesson.cards[1].activity.exercise.conceptIDs,['sense-stays']);assert.equal(nextLesson.cards[1].activity.exercise.correctChoiceID,'correct');
});


test('compatible delivery controls never submit the paused saved document or use legacy publication',async()=>{
 const {legacyPublicationBlocked,deliveryRequest}=await import('../app/admin/catalog-model.ts');
 const record={id:'spanish-course',kind:'course',status:'published',revision:10,publishedRevision:9,document:{id:'spanish-course',title:'Paused expansion'}};
 assert.equal(legacyPublicationBlocked(record,record.document),true);
 const additions={units:[{id:'new-unit'}],learning:{starter:{id:'starter'}}};
 const body=deliveryRequest(record,'prepare',additions);
 assert.equal(body.sourceRevision,9);assert.equal(body.expectedRevision,10);assert.equal(body.document,undefined);assert.equal(body.additions,additions);assert.equal(body.profile,'practice-v1');
 assert.throws(()=>deliveryRequest(record,'prepare',record.document));assert.throws(()=>deliveryRequest(record,'prepare',{...additions,document:record.document}));assert.throws(()=>deliveryRequest(record,'activate',undefined,11));
 record.deliveries=[{profile:'practice-v1',revision:11,sourceRevision:9,state:'candidate',digest:'hash',title:'Candidate'}];
 assert.equal(deliveryRequest(record,'activate',undefined,11).deliveryRevision,11);assert.throws(()=>deliveryRequest(record,'rollback',undefined,11));
 record.deliveries[0].activatedAt=1;assert.equal(deliveryRequest(record,'rollback',undefined,11).deliveryRevision,11);
 assert.deepEqual(record.document,{id:'spanish-course',title:'Paused expansion'});
 assert.equal(legacyPublicationBlocked({...record,id:'korean-course',publishedRevision:null,deliveries:[]},{}),false);
});
