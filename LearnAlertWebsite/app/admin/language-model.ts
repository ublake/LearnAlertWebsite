import type { JSONObject, JSONValue, TreeNode } from './catalog-model';

const list = (value: JSONValue | undefined) => Array.isArray(value) ? value as JSONObject[] : [];
const obj = (value: JSONValue | undefined): JSONObject => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const text = (value: JSONValue | undefined) => typeof value === 'string' ? value : '';

/** Keep IDs and real attachments; retire the old presentation metadata. */
export function simpleLanguageDocument(source: JSONObject): JSONObject {
  if (source.presentation === 'deck_collection') return source;
  const all = list(source.units).flatMap(unit => list(unit.lessons).flatMap(lesson => list(lesson.cards)));
  const answers = [...new Set(all.map(card => text(card.correctAnswer)).filter(value => value && value.length < 90))];
  const visuals = [
    ['apple','사과','la manzana'],['banana','바나나','el plátano'],['orange','오렌지','la naranja'],['grapes','포도','las uvas'],
    ['cat','고양이','el gato'],['dog','개','el perro'],['rabbit','토끼','el conejo'],['bird','새','el pájaro'],
    ['coffee','커피','el café'],['water','물','el agua'],['rice','밥','el arroz'],['milk','우유','la leche'],
    ['book','책','el libro'],['bag','가방','la mochila'],['chair','의자','la silla'],['clock','시계','el reloj']
  ].map(([image,ko,es])=>({image:'course-vocab-'+image,word:source.language==='Korean'?ko:es})).filter(()=>['Korean','Spanish'].includes(text(source.language)));
  const expand = (lesson: JSONObject, cards: JSONObject[]) => {
    const ids=new Set(cards.map(card=>card.id));
    const pairs=cards.flatMap(card=>Array.isArray(card.matchingLeftItems)?card.matchingLeftItems.map((left,i)=>[text(left),text((card.matchingRightItems as JSONValue[] || [])[i])]):[]).filter(([left,right])=>left&&right);
    for(const card of cards.filter(card=>card.cardType==='matching')) {
      const left=card.matchingLeftItems as JSONValue[] || [],right=card.matchingRightItems as JSONValue[] || [];
      left.slice(0,8).forEach((value,i)=>{ if(!text(value)||!text(right[i]))return;
        for(const reverse of [false,true]) {
          const answer=text(reverse?value:right[i]),choices=[answer,...[...new Set(pairs.map(pair=>pair[reverse?0:1]))].sort().filter(word=>word!==answer).slice(0,3)];
          const id=card.id+`-pair-${i}-`+(reverse?'reverse':'forward');
          if(choices.length>=2&&!ids.has(id))cards.push({id,question:reverse?right[i]:value,options:choices,correctAnswer:answer,correctOptionIndex:0,cardType:'multipleChoice'});
        }
      });
    }
    const terms=new Set(list(lesson.cards).flatMap(card=>[...(card.options as JSONValue[]||[]),...(card.matchingLeftItems as JSONValue[]||[]),...(card.matchingRightItems as JSONValue[]||[]),card.correctAnswer]));
    const relevant=visuals.filter(word=>terms.has(word.word)||terms.has(word.word.replace(/^(el|la|los|las) /,''))).slice(0,8);
    for(const word of relevant) {
      const choices=[word,...visuals.filter(other=>other.image!==word.image).slice(0,3)],stem=lesson.id+'-visual-'+word.image;
      if(!ids.has(stem+'-picture'))cards.push({id:stem+'-picture',question:word.word,options:choices.map(()=>''),correctAnswer:'',correctOptionIndex:0,cardType:'multipleChoice',fieldMedia:Object.fromEntries(choices.map((choice,i)=>['option:'+i,{image:choice.image}]))});
      if(!ids.has(stem+'-word'))cards.push({id:stem+'-word',question:'',options:choices.map(choice=>choice.word),correctAnswer:word.word,correctOptionIndex:0,cardType:'multipleChoice',fieldMedia:{prompt:{image:word.image}}});
    }
    return cards;
  };
  const regular = (card: JSONObject): JSONObject | null => {
    const activity = obj(card.activity), exercise = obj(activity.exercise);
    if (activity.kind === 'trace' || exercise.format === 'exposure' || activity.kind === 'teach' && !exercise.format || text(card.id).endsWith('-guide')) return null;
    let options = Array.isArray(card.options) ? card.options : [], answer = text(card.correctAnswer), question = text(card.readingPrompt) || text(card.question);
    let cardType = text(card.cardType), index = typeof card.correctOptionIndex === 'number' ? card.correctOptionIndex : options.indexOf(answer);
    let left = card.matchingLeftItems || [], right = card.matchingRightItems || [];
    const fieldMedia = { ...obj(card.fieldMedia) };
    delete fieldMedia.hint;
    if(card.promptImageName || card.promptAudioName)fieldMedia.prompt={...obj(fieldMedia.prompt),...(card.promptImageName?{image:card.promptImageName}:{}),...(card.promptAudioName?{audio:card.promptAudioName}:{})};
    if(card.answerImageName)fieldMedia.answer={...obj(fieldMedia.answer),image:card.answerImageName};
    if(Array.isArray(card.optionImageNames))card.optionImageNames.forEach((image,i)=>{if(image)fieldMedia[`option:${i}`]={...obj(fieldMedia[`option:${i}`]),image};});
    if (exercise.format === 'pictureChoice') {
      const pictures = list(exercise.pictures); index = pictures.findIndex(picture => picture.id === exercise.correctChoiceID);
      if (index < 0 || pictures.length < 2) return null;
      options = pictures.map(() => ''); answer = ''; cardType = 'multipleChoice'; question = text(exercise.stimulusText) || question;
      pictures.forEach((picture, i) => { fieldMedia[`option:${i}`] = { image: picture.image }; });
    } else if (exercise.format === 'choice') {
      const choices = list(exercise.choices); index = choices.findIndex(choice => choice.id === exercise.correctChoiceID);
      if (index < 0 || choices.length < 2) return null;
      options = choices.map(choice => choice.text); answer = text(options[index]); cardType = 'multipleChoice';
    } else if (['matching','textMatching'].includes(text(exercise.format))) {
      const pairs = list(exercise.pairs); left = pairs.map(pair => pair.label); right = pairs.map(pair => exercise.format === 'textMatching' || !pair.image ? pair.description : '');
      pairs.forEach((pair, i) => { if (exercise.format !== 'textMatching' && pair.image) fieldMedia[`right:${i}`] = { image: pair.image }; }); cardType = 'matching';
    } else if (exercise.format === 'wordBank') {
      const orders = exercise.acceptedOrders; if (!Array.isArray(orders) || !Array.isArray(orders[0])) return null;
      answer = orders[0].join(' '); options = []; cardType = 'multipleChoice';
    }
    if (cardType === 'matching' || activity.kind === 'matchPairs') { if (!Array.isArray(left) || left.length < 2 || !Array.isArray(right) || left.length !== right.length) return null; cardType = 'matching'; }
    else {
      if (options.length < 2) { if (!answer || answer.length >= 90) return null; options = [answer, ...answers.filter(value => value !== answer).slice(0,3)]; index = 0; }
      if (options.length < 2 || index < 0) return null;
      cardType = ['fillBlank','fill_blank'].includes(cardType) && /_{2,}|\{blank\}|\[blank\]/.test(question) ? 'fillBlank' : 'multipleChoice';
    }
    return { id: card.id, question, options, correctAnswer: answer, cardType, matchingLeftItems: left, matchingRightItems: right,
      fieldMedia, ...(cardType === 'matching' ? {} : {correctOptionIndex: index}) };
  };
  return { id: source.id, title: source.title, language: source.language, flagEmoji: source.flagEmoji || '🌱', levelTag: '', colorHex: source.colorHex || '#75B9DA', summary: '', estimatedHours: 0, outcomes: [], presentation: 'deck_collection',
    units: list(source.units).map(unit => ({id: unit.id, title: unit.title, unitNumber: unit.unitNumber, subtitle: '', colorHex: unit.colorHex || source.colorHex, badgeIcon: 'rectangle.stack',
      lessons: list(unit.lessons).map(lesson => ({id: lesson.id, title: lesson.nodeType === 'checkpoint' ? 'Review' : lesson.title, lessonNumber: lesson.lessonNumber, subtitle: '', nodeType: 'lesson', estimatedMinutes: 0, ...(lesson.importance !== undefined ? {importance:lesson.importance} : {}), cards: expand(lesson, list(lesson.cards).map(regular).filter((card): card is JSONObject=>card!==null))})).filter(lesson => lesson.cards.length)
    })).filter(unit => unit.lessons.length) };
}

export function languageTree(document: JSONObject): TreeNode {
  return {path: [], label: text(document.title) || 'Language collection', type: 'Collection', children: list(document.units).flatMap((unit,u) => list(unit.lessons).map((deck,l) => ({
    path: ['units',u,'lessons',l], label: text(deck.title) || 'Topic deck', type: 'Deck', children: list(deck.cards).map((card,c) => ({path: ['units',u,'lessons',l,'cards',c], label: text(card.question) || (card.promptImageName || obj(obj(card.fieldMedia).prompt).image ? 'Picture question' : 'Card'), type: 'Card', detail: text(card.cardType), children: []}))
  }))) };
}

