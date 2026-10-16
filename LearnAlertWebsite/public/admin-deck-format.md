# LearnAlert deck import format

## Import workflow

1. Open Admin → New deck → Import JSON.
2. Choose the author in the site. Paste one deck object, not an array of decks or only a cards array. Use valid JSON with double quotes and no comments, trailing commas, or Markdown fences.
3. If the JSON names images/audio, select the corresponding files with exactly matching filenames.
4. Click Create draft. The site validates cards, uploads referenced files, converts filenames to stored media IDs, and opens the deck editor.
5. Review the deck. Save changes keeps a draft private. Publish deck makes it available to browse/download. Imported media follows the deck’s visibility.

The downloadable template includes all five text card types and needs no image files. Image-only cards use the sixth type, images, and require an image file. Import one deck at a time. All six types can be mixed in one deck.

## Deck fields

| Field | Required / default | Format and limit |
| --- | --- | --- |
| name | Required | Non-empty text, up to 120 characters |
| description | Optional; empty text | Up to 2000 characters |
| categoryTag | Optional; General | Non-empty category text, up to 60 characters |
| colorHex | Optional; #5B70E0 | Exactly # plus six hexadecimal digits, such as #5B70E0 |
| deckType | Optional; Mixed | Non-empty label, up to 40 characters. Mixed, Quiz, and Vocabulary are common labels. Course is not supported. Individual cardType fields determine card behavior. |
| cards | Required | Array of 1–500 card objects. Keep the complete JSON under 1 MB. |

Choose authorship in the Author selector. The official option creates/uses the dedicated @learnalert profile; an existing profile can also be selected. Author, deck ID, ownership, status, visibility, dates, revisions, download counts, and report counts are managed by the site and are not import fields. New imports start with zero downloads. Dates use the server’s creation/publication time.

Do not include origin, sourceCommunityID, or sourcePremadeID from an exported/downloaded app deck. Imported decks must be original content; Course decks are unsupported. Unknown fields do not become custom app data and may be discarded. Use only the documented fields.

## Common card fields

| Field | Required / default | Format and limit |
| --- | --- | --- |
| id | Recommended; generated if omitted | Unique, non-empty string up to 64 characters. Use an explicit unique ID on every card to avoid collisions. |
| cardType | Required | Exactly vocabulary, tap_reveal, multiple_choice, matching, fill_blank, or images |
| question | Optional when prompt media exists | Text up to 5000 characters, or empty with a prompt image/audio. Matching instructions are optional. Images cards keep text empty. |
| correctAnswer | Text answer, optional with answer media | Up to 10000 characters. Quiz cards use correctOptionIndex; matching/images leave this empty. |
| hint | Optional; empty text | Up to 2000 characters; must be empty for images |
| sectionName | Optional; empty text | Up to 120 characters; groups cards into a section |
| options | Required for multiple_choice | 2–4 strings. Each may be empty when the corresponding option has an image/audio. |
| correctOptionIndex | Required for media-only/duplicate quiz choices | Zero-based correct choice index. Old text decks may still use an exact unique correctAnswer. |
| fieldMedia | Optional | Field-keyed images/audio, described below. Text is optional when that field has media. |
| matchingLeftItems | Required for matching | Array of 2–20 strings, each up to 5000 characters. An empty item requires image/audio in its left:index slot. Otherwise omit or use []. |
| matchingRightItems | Required for matching | Same count as matchingLeftItems. Items at corresponding indices form pairs. Otherwise omit or use []. |
| promptImage | Required for images; otherwise optional | PNG/JPEG filename for the card image |
| answerImage | Optional | PNG/JPEG filename for a revealed answer/back image |
| promptAudio | Optional except images | MP3/M4A/WAV filename for the prompt audio |
| optionImages | Optional | Array of image filenames or null, aligned with options. No more entries than choices. |

Text fields must be strings. A prompt, answer, choice, or matching item may contain text, an image, audio, or a combination. Each required field must have at least one kind of content. Hints are optional. Keep card IDs unique. Image cards retain their image-only front/back layout.

## Every card type

Each example below is one card object to place inside the deck’s cards array.

### Vocabulary (vocabulary)

Use question for the term and correctAnswer for its definition. No choices or matching arrays are required.

```json
{
  "id": "vocab-1",
  "cardType": "vocabulary",
  "question": "Mitochondrion",
  "correctAnswer": "An organelle that produces most of a cell’s ATP.",
  "hint": "Think cellular energy.",
  "sectionName": "Cell biology"
}
```

### Tap reveal (tap_reveal)

Use question for the prompt and correctAnswer for the answer shown after revealing.

```json
{
  "id": "reveal-1",
  "cardType": "tap_reveal",
  "question": "What does the nucleus do?",
  "correctAnswer": "It stores DNA and helps control cell activities.",
  "hint": "It contains genetic instructions.",
  "sectionName": "Cell biology"
}
```

### Multiple choice (multiple_choice)

Use 2–4 choices and correctOptionIndex (zero-based). Text-only legacy decks can still set correctAnswer to one unique option string. Empty or repeated option strings require correctOptionIndex so media-only answers remain distinct.

```json
{
  "id": "quiz-1",
  "cardType": "multiple_choice",
  "question": "Which structure makes proteins?",
  "correctAnswer": "Ribosome",
  "options": [
    "Ribosome",
    "Nucleus",
    "Lysosome",
    "Cell membrane"
  ],
  "hint": "It translates messenger RNA.",
  "sectionName": "Cell biology"
}
```

### Matching (matching)

Use equal-length left/right arrays with 2–20 complete pairs. The first left item matches the first right item, the second matches the second, and so on. The question supplies the matching instruction. correctAnswer can be empty.

```json
{
  "id": "match-1",
  "cardType": "matching",
  "question": "Match each cell structure to its function.",
  "correctAnswer": "",
  "matchingLeftItems": [
    "Nucleus",
    "Mitochondrion",
    "Ribosome"
  ],
  "matchingRightItems": [
    "Stores DNA",
    "Produces ATP",
    "Makes proteins"
  ],
  "hint": "Items at the same position form a pair.",
  "sectionName": "Cell biology"
}
```

### Fill in the blank (fill_blank)

Put a blank such as ___ in question and the missing word or phrase in correctAnswer. No options are required. The server validates the card type and fields; it does not infer or check the blank against the answer.

```json
{
  "id": "blank-1",
  "cardType": "fill_blank",
  "question": "The ___ controls what enters and leaves the cell.",
  "correctAnswer": "cell membrane",
  "hint": "It surrounds the cell.",
  "sectionName": "Cell biology"
}
```

### Image only (images)

Use a required front image and an optional back image, with no question, answer, hint, choices, matching pairs, option images, or audio. Omit answerImage for a single-image review card; include it to reveal a second picture on the back. Supply both actual image files alongside the JSON when using both sides.

```json
{
  "id": "picture-1",
  "cardType": "images",
  "question": "",
  "correctAnswer": "",
  "promptImage": "cell-diagram.png",
  "answerImage": "cell-labels.png",
  "sectionName": "Cell biology"
}
```

## Images and audio — all supported placements

- promptImage attaches one image to the question. It can be used on any card type.
- answerImage attaches an answer/back image to vocabulary, tap_reveal, fill_blank, or images cards.
- promptAudio attaches one audio recording to the question. It can be used on any text card type, together with an image if needed. Image-only cards do not support audio.
- optionImages attaches images to quiz choices. Use null for an absent image. Choices with images/audio need no text; use correctOptionIndex.
- fieldMedia adds images/audio to prompt, answer, hint, option:0…option:3, left:0…left:19, and right:0…right:19. Each entry is {"image":"filename.png","audio":"filename.wav"}; omit either part. Indices align with the options/matching arrays. For imports use filenames; the saved editor/API uses imageID/audioID instead.
- A fill_blank answer with only media uses reveal and self-assessment, since there is no answer text to type.
- Image cards keep their image-only layout; no audio, text, hints, or choices. Video, PDFs, and remote image URLs are unsupported.

Use plain filenames, for example cell.png, not folder/cell.png, a local path, a URL, base64, or an invented media ID. Filenames are case-sensitive. Select every referenced file; duplicate filenames in the file selection are rejected. The same filename may be reused by several cards and is uploaded once. Extra unreferenced selected files are not uploaded. A file cannot be referenced as both an image and audio.

Supported formats and limits:

| Media | Extensions | Maximum per file |
| --- | --- | --- |
| PNG image | .png | 10 MB |
| JPEG image | .jpg, .jpeg | 10 MB |
| MP3 audio | .mp3 | 20 MB |
| M4A audio | .m4a | 20 MB |
| WAV audio | .wav | 20 MB |

Up to 100 MB and 1000 referenced media files per deck. Files must contain the advertised format; renaming a WebP file to .png is not a conversion. GIF, WebP, SVG, HEIC, and other formats are not accepted by this uploader. Generate/export PNG or JPEG images instead. The JSON size limit is separate from the media limit.

An AI image description is not an uploaded image. Ask the AI to supply actual files separately with exactly the filenames used in the JSON. If the AI cannot generate files, keep its image-generation descriptions outside the JSON and create the images separately. A text-only deck can omit every media field.

### Complete media example

This needs cell.png, nucleus.mp3, ribosome.png, nucleus.png, and membrane.jpg. The third choice has no image.

```json
{
  "name": "Cell Biology — Images and Audio",
  "description": "Example media references; upload the named files.",
  "categoryTag": "Science",
  "colorHex": "#5B70E0",
  "deckType": "Mixed",
  "cards": [
    {
      "id": "reveal-1",
      "cardType": "tap_reveal",
      "question": "What does the nucleus do?",
      "correctAnswer": "It stores DNA and helps control cell activities.",
      "hint": "It contains genetic instructions.",
      "sectionName": "Cell biology",
      "promptImage": "cell.png",
      "promptAudio": "nucleus.mp3"
    },
    {
      "id": "quiz-1",
      "cardType": "multiple_choice",
      "question": "Which pictured structure makes proteins?",
      "correctAnswer": "Ribosome",
      "options": [
        "Ribosome",
        "Nucleus",
        "Lysosome",
        "Cell membrane"
      ],
      "hint": "It translates messenger RNA.",
      "sectionName": "Cell biology",
      "optionImages": [
        "ribosome.png",
        "nucleus.png",
        null,
        "membrane.jpg"
      ]
    }
  ]
}
```

The importer converts promptImage, answerImage, promptAudio, and optionImages into promptImageID, answerImageID, promptAudioID, and optionImageIDs after uploading. The same applies to fieldMedia imageID/audioID: imports use image/audio filenames, saved cards use IDs. Those internal IDs belong to saved decks and the editor; do not use them in a new import. Existing saved card JSON uses a cards array, while the New deck importer expects a full deck object.

## Complete text-only deck — all five text types

This is the downloadable template. It imports without selecting media files.

```json
{
  "name": "Cell Biology — Text Card Types",
  "description": "Five examples covering the text card types.",
  "categoryTag": "Science",
  "colorHex": "#5B70E0",
  "deckType": "Mixed",
  "cards": [
    {
      "id": "vocab-1",
      "cardType": "vocabulary",
      "question": "Mitochondrion",
      "correctAnswer": "An organelle that produces most of a cell’s ATP.",
      "hint": "Think cellular energy.",
      "sectionName": "Cell biology"
    },
    {
      "id": "reveal-1",
      "cardType": "tap_reveal",
      "question": "What does the nucleus do?",
      "correctAnswer": "It stores DNA and helps control cell activities.",
      "hint": "It contains genetic instructions.",
      "sectionName": "Cell biology"
    },
    {
      "id": "quiz-1",
      "cardType": "multiple_choice",
      "question": "Which structure makes proteins?",
      "correctAnswer": "Ribosome",
      "options": [
        "Ribosome",
        "Nucleus",
        "Lysosome",
        "Cell membrane"
      ],
      "hint": "It translates messenger RNA.",
      "sectionName": "Cell biology"
    },
    {
      "id": "match-1",
      "cardType": "matching",
      "question": "Match each cell structure to its function.",
      "correctAnswer": "",
      "matchingLeftItems": [
        "Nucleus",
        "Mitochondrion",
        "Ribosome"
      ],
      "matchingRightItems": [
        "Stores DNA",
        "Produces ATP",
        "Makes proteins"
      ],
      "hint": "Items at the same position form a pair.",
      "sectionName": "Cell biology"
    },
    {
      "id": "blank-1",
      "cardType": "fill_blank",
      "question": "The ___ controls what enters and leaves the cell.",
      "correctAnswer": "cell membrane",
      "hint": "It surrounds the cell.",
      "sectionName": "Cell biology"
    }
  ]
}
```

## Drafts, editing, and retries

- Create draft does not publish. Review first, then explicitly Publish deck.
- Blank deck creates an empty private draft. Add at least one valid card before saving/publishing.
- Admin-created drafts do not expire automatically. Save changes to keep uploaded media linked to cards; unused, unsaved attachments may be cleaned up after 24 hours.
- If an import fails after creating a draft or uploading some files, Continue import reuses that draft and successful uploads while the page stays open. The draft is also available in Decks. A page reload resets the importer’s retry state.
- Every editable card field has compact Attach controls with image/audio previews and removal. On touch screens, swipe a text field left to open Attach. Hints start unchecked; enable Hint to reveal its field. Removing a back image returns an images card to single-image review.
- Saved edits are validated again. A stale-save error means the deck changed; close and reopen it before retrying. Existing downloaded copies on users’ devices are not remotely overwritten.

## Common validation errors

| Error | Fix |
| --- | --- |
| Invalid JSON | Remove Markdown fences/comments/trailing commas; use double quotes. |
| Missing referenced file | Select the exact filename named by promptImage, answerImage, promptAudio, or optionImages, or remove that reference. |
| Duplicate filename | Rename one file and update its reference. |
| Invalid card type | Use one of the six exact lowercase cardType values. |
| Invalid image card | Supply one promptImage file, optionally one answerImage file, and remove question/answer/hint text, choices, pairs, option images, and audio. |
| Invalid/duplicate card ID | Use a distinct non-empty string on every card, at most 64 characters. |
| Invalid multiple-choice card | Supply 2–4 choices with text or media, and a valid correctOptionIndex. |
| Invalid matching card | Use 2–20 complete pairs with equal left/right array lengths. |
| Invalid answer images | Make optionImages an array with no more elements than options; use null for absent images. |
| Unsupported/oversized file | Export an accepted format and keep within per-file and total limits. |
| Foreign/unavailable media ID | For imports use filenames and actual files; never copy another deck’s stored media IDs. |

## AI generation prompt

Copy the following prompt and add your topic, intended level, number of cards, and desired card types.

```text
Generate one original LearnAlert deck as valid JSON only. Use name, description, categoryTag, colorHex (#RRGGBB), deckType, and cards (1–500). Each card needs a unique string id and cardType: vocabulary, tap_reveal, multiple_choice, matching, fill_blank, or images. Text fields question/correctAnswer/hint are optional when that field has an image/audio, with limits 5000/10000/2000 characters. Quiz options contain 2–4 strings, possibly empty for media-only choices; set correctOptionIndex to the zero-based right answer. Matching uses equal arrays matchingLeftItems/matchingRightItems with 2–20 entries, possibly empty when the same slot has media. Image cards require promptImage and optionally answerImage, and keep all text, audio, choices and pairs empty.
Attach media with fieldMedia: {"prompt":{"image":"front.png","audio":"question.wav"},"answer":{"audio":"answer.wav"},"hint":{"image":"clue.png"},"option:0":{"audio":"choice.wav"},"left:0":{"image":"left.png"},"right:0":{"audio":"right.wav"}}. Only use slots presented by that card type. Every required prompt/answer/choice/pair item needs text or media. Legacy promptImage, answerImage, promptAudio, optionImages filenames remain supported. Provide actual PNG/JPEG or MP3/M4A/WAV files separately with matching plain filenames; do not invent media IDs, paths, URLs or base64. Images max 10 MB, audio max 20 MB, total 100 MB/1000 files per deck. Keep JSON under 1 MB. Media-only fill_blank answers are revealed for self-assessment. Do not include account/ownership/status/counter fields. If unable to generate media, put production descriptions outside the JSON.
```
