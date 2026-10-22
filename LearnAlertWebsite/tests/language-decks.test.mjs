import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {simpleLanguageDocument,languageTree} from '../app/admin/language-model.ts';
import {legacyPublicationBlocked} from '../app/admin/catalog-model.ts';
const fixture=()=>JSON.parse(fs.readFileSync(new URL('../public/admin-course-template.json',import.meta.url)));
test('language conversion preserves source and card identities while removing custom structure',()=>{
 const source=fixture(), before=JSON.stringify(source), card=source.units[0].lessons[0].cards[0];
 const next=simpleLanguageDocument(source);
 assert.equal(JSON.stringify(source),before);assert.equal(next.id,source.id);assert.equal(next.presentation,'deck_collection');
 assert.equal(next.units[0].lessons[0].cards[0].id,card.id);
 for(const field of ['learning','guides','guidePresentation'])assert.equal(next[field],undefined);
 assert.ok(next.units.every(unit=>!unit.checkpointQuiz));
 assert.ok(next.units.flatMap(unit=>unit.lessons).flatMap(deck=>deck.cards).every(card=>!card.activity&&!card.grammarNote&&!card.explanation));
 const tree=languageTree(next);assert.equal(tree.type,'Collection');assert.equal(tree.children[0].type,'Deck');assert.deepEqual(tree.children[0].children[0].path,['units',0,'lessons',0,'cards',0]);
 assert.equal(legacyPublicationBlocked({id:source.id,kind:'course',publishedRevision:9,deliveries:[{profile:'practice-v2'}]},next),false);
});
test('drawing and explanation cards disappear while uploaded picture choices survive',()=>{
 const source=fixture(), lesson=source.units[0].lessons[0];
 lesson.cards.push({...lesson.cards[0],id:'draw',activity:{kind:'trace'}});
 lesson.cards.push({...lesson.cards[0],id:'explain',activity:{kind:'teach'}});
 lesson.cards[0]={...lesson.cards[0],activity:{kind:'situation',exercise:{format:'pictureChoice',stimulusText:'la manzana',correctChoiceID:'apple',pictures:[{id:'apple',image:'catalog:apple'},{id:'pear',image:'catalog:pear'}]}}};
 const cards=simpleLanguageDocument(source).units[0].lessons[0].cards;
 assert.ok(!cards.some(card=>['draw','explain'].includes(card.id)));
 assert.equal(cards[0].question,'la manzana');assert.deepEqual(cards[0].options,['','']);assert.equal(cards[0].correctOptionIndex,0);assert.equal(cards[0].fieldMedia['option:0'].image,'catalog:apple');
});

test('Spanish food pairs become repetitive quizzes and four-picture word questions',()=>{
 const source=fixture();source.language='Spanish';
 source.units[0].lessons[0].cards=[{id:'fruit-pairs',question:'Match',cardType:'matching',options:[],correctAnswer:'',matchingLeftItems:['la manzana','el plátano','el agua'],matchingRightItems:['apple','banana','water']}];
 const next=simpleLanguageDocument(source),cards=next.units[0].lessons[0].cards;
 assert.equal(cards.filter(card=>card.cardType==='matching').length,1);
 assert.ok(cards.filter(card=>card.cardType==='multipleChoice').length>=12);
 const apple=cards.find(card=>card.question==='la manzana'&&card.options.every(option=>option===''));
 assert.ok(cards.find(card=>card.id==='fruit-pairs-pair-0-forward').options.every(word=>['apple','banana','water'].includes(word)));
 assert.equal(apple.options.length,4);assert.equal(apple.fieldMedia['option:0'].image,'course-vocab-apple');
 assert.strictEqual(simpleLanguageDocument(next),next);
});
