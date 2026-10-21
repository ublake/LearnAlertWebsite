# LearnAlert managed catalog • format v1

This document is for the private /admin content studio. Nothing is published by importing or saving. Review, validate and explicitly Publish.

## AI instructions

Start from an exported course/exam JSON document and this guide. Return one complete JSON object, not prose, markdown or a partial patch. Preserve existing IDs and unknown properties. Give additions unique stable IDs. Do not regenerate existing lesson/card/unit IDs: the app uses them for progress. Do not invent media that has not been supplied. Keep question language clear, material correct, and alternative questions varied. Do not change answer semantics when rewording a question. New material should teach, practice, and check the same concepts in different ways. Keep audio questions usable without listening by supplying readingPrompt. Never publish automatically.

Download /admin-catalog-schema.json, /admin-course-template.json and /admin-exam-template.json for machine-readable examples.

## Transport

The editor imports/exports the document itself; {document: ...} envelopes are accepted too. Admin API records wrap documents with id,kind,title,status,revision,publishedRevision,updatedAt,publishedAt. Timestamps are epoch seconds. POST catalog accepts {id,kind,document,sortOrder}; PUT catalog/:id accepts {document,sortOrder,expectedRevision}. Whole-entry Duplicate also supplies sourceCatalogID so the backend securely clones its owned media and rewrites references; ordinary imports do not. sortOrder is catalog metadata, not a field inside the native course/deck document. Lower finite numbers appear first; the compact Order control preserves it while navigating nodes or JSON mode. New entries default after the existing entries. POST catalog/:id/publish, /archive or /restore requires expectedRevision; restore may include revision. DELETE is reversible. Draft saves retain the published revision. GET catalog/:id/history returns revisions; GET catalog/:id?revision=N returns a historical snapshot. Revision conflicts must be resolved explicitly, never overwritten silently. Transport budget: 16 MiB JSON, no arbitrary question-count limit. Large media is uploaded separately.

## Course document

Root: id,title,language,flagEmoji,levelTag,colorHex,summary,estimatedHours,outcomes(string[]),units(unit[]),guides(object),guidePresentation(object). colorHex is #RRGGBB. IDs begin with a letter or digit and contain up to 128 letters, digits, dots, underscores or hyphens. Keep the root ID the same as its catalog entry.

Unit: id,unitNumber,title,subtitle,colorHex,badgeIcon(SF Symbol name),lessons(lesson[]),checkpointQuiz(optional).

Lesson: id,lessonNumber,title,subtitle,nodeType,estimatedMinutes,tipNote(optional),cards(courseCard[]). nodeType: lesson,practice,checkpoint,cultural_tip. Display order follows arrays; numbers should match that order.

Checkpoint: id,title,summary,passingScoreThreshold(number from 0 to 1),questions(courseCard[]),keyConcepts(string[]). It belongs at unit.checkpointQuiz. This is separate from a lesson whose nodeType is checkpoint.

Course card required fields: id,question,options(string[]),correctAnswer,hint,cardType,matchingLeftItems(string[]),matchingRightItems(string[]),optionImageNames(string[]).

Course card types: multipleChoice,tapReveal,fillBlank,matching,vocabulary,listening,listeningWrite,hangulTrace,hangulBuild,tokenPlacement. Use multipleChoice with correctAnswer matching an options entry. Matching arrays must align. Courses use camelCase card types; exam and community cards use snake_case.

Optional card fields: promptImageName,vocabularyItem,grammarNote,speechText,conceptTag,explanation,acceptedAnswers(string[]),readingPrompt,previousQuestion,activity. previousQuestion is only for matching legacy course-deck cards during sync; avoid adding it for new cards. Text for audio comes from speechText; readingPrompt is its readable alternative. Additional supported media fields are listed below.

Vocabulary item: surface,dictionaryForm,romanization,partOfSpeech,contextualMeaning,breakdownNote(optional),exampleKorean(optional),exampleEnglish(optional),audioText(optional). Names reflect the original Korean course but may describe another language.

Activity: kind,sequence,rule(optional),example(optional),symbol(optional),layout,tokens(string[]),slots(string[]),slotLabels(string[]),optionHints(string→string object),readingCue(optional),practiceGroup(optional). kind: teach,trace,buildBlock,placeTokens,listenChoose,situation,matchPairs. layout: inline,beside,below,besideWithFinal,belowWithFinal. Preserve tokens/slots and paired labels. The app renders these as native interactions.

## Guides

Root guides is a unit-ID-keyed object: {"unit-id":[{"title":"Rule","rule":"Detailed explanation","examples":["Example → meaning"]}]}. Any unit can have any number of topics. Keep guide keys in sync with unit IDs.

Root guidePresentation is also keyed by unit ID: {"unit-id":{"showsHangulDiagram":true,"referenceTitle":"Optional link label","referenceURL":"https://..."}}. Set showsHangulDiagram only when the Hangul stacking graphic helps. Optional diagramTitle,diagramFooter,diagramExamples let you replace every Hangul graphic label and example. diagramExamples is an array of {syllable,caption,initial,vowel,final(optional),layout:beside|below}. Empty guide/reference values are optional. Reference links must be https. Do not place guides inside lessons or units; the app consumes the root maps.

## Exam and certification decks

Root: id,name,category,subcategory,description,colorHex,deckType,cards(examCard[]). category is normally Exam Prep. Existing categories/subjects may be retained. deckType is a display label such as Mixed.

Exam card: id,question,options,correctAnswer,hint,cardType,matchingLeftItems,matchingRightItems,optionImageNames,promptImageName(optional),answerImageName(optional),promptAudioName(optional),fieldMedia(optional object),correctOptionIndex(optional integer),sectionName. Card types: multiple_choice,tap_reveal,fill_blank,matching,vocabulary,images,anki. Media-only text fields can be empty when suitable media exists; images cards use a front image with optional back image. For choice media, fieldMedia keys are option:0,option:1 etc; matching keys are left:0/right:0. Correct option indices start at 0.

## Images and audio

Bundled asset names remain supported. New uploads use catalog:<UUID> references from POST catalog/:id/media. Do not store arbitrary filesystem paths, data URLs or guessed filenames. Supported files: PNG/JPEG up to 10 MiB; MP3/M4A/WAV up to 20 MiB. Media IDs stay stable when exporting a document; the same backend serves them to the app and authorized preview.

Store prompt/answer/choice image references in promptImageName,answerImageName,optionImageNames. promptAudioName supplies a real audio file; speechText supplies synthesized speech. fieldMedia may map prompt,answer,hint,option:N,left:N,right:N to {image:"catalog:<uuid>",audio:"catalog:<uuid>"}. Not every course interaction uses every media field; retain reading alternatives. The native app controls final rendering.

## Editing workflow

1. Export the current entry and make a local backup.
2. Edit fields or selected-node/full-document JSON. Unknown fields are retained.
3. Add/reorder/duplicate/delete units, lessons, guides, checkpoints and cards in the outline. Duplicate creates fresh content IDs, remaps guide keys, and copies referenced media into the new entry's ownership.
4. Upload real media and paste its reference in the relevant property. One uploaded file can attach directly to the chosen prompt/answer target.
5. Validate; fix errors before publishing. Save draft does not change the public app catalog.
6. Publish deliberately. The app refreshes its catalog while retaining device-local progress for stable IDs. Revision history can be exported or restored into a new draft.
7. Archive hides an entry from the offered catalog; deletion can be restored. Existing downloaded device-local copies remain.

Cloudflare Access remains mandatory for every /admin endpoint. Admin/API credentials never belong in exported JSON.
