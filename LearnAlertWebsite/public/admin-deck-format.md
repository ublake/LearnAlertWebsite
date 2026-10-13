# LearnAlert deck import format

## Import workflow

1. Open Admin → New deck → Import JSON.
2. Choose the author in the site. Paste one deck object, not an array of decks or only a cards array. Use valid JSON with double quotes and no comments, trailing commas, or Markdown fences.
3. If the JSON names images/audio, select the corresponding files with exactly matching filenames.
4. Click Create draft. The site validates cards, uploads referenced files, converts filenames to stored media IDs, and opens the deck editor.
5. Review the deck. Save changes keeps a draft private. Publish deck makes it available to browse/download. Imported media follows the deck’s visibility.

The downloadable template includes all five card types and needs no image files. Import one deck at a time. All five types can be mixed in one deck.

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
| cardType | Required | Exactly vocabulary, tap_reveal, multiple_choice, matching, or fill_blank |
| question | Required | Non-empty text, up to 5000 characters |
| correctAnswer | Required except matching | Non-empty text up to 10000 characters. For matching, omit it or use an empty string. |
| hint | Optional; empty text | Up to 2000 characters |
| sectionName | Optional; empty text | Up to 120 characters; groups cards into a section |
| options | Required for multiple_choice | Array of 2–4 non-empty choice strings, each up to 5000 characters. Otherwise omit or use []. |
| matchingLeftItems | Required for matching | Array of 2–20 non-empty strings, each up to 5000 characters. Otherwise omit or use []. |
| matchingRightItems | Required for matching | Same count as matchingLeftItems. Items at corresponding indices form pairs. Otherwise omit or use []. |
| promptImage | Optional | PNG/JPEG filename for the prompt image |
| promptAudio | Optional | MP3/M4A/WAV filename for the prompt audio |
| optionImages | Optional | Array of image filenames or null, aligned with options. No more entries than choices. |

Text fields must be strings, not numbers, objects, or null. Media fields may be omitted, empty, or null. Keep card IDs unique across the deck. Trimmed empty questions/answers are invalid except the matching answer.

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

Use 2–4 choices. correctAnswer must exactly match one options string, including capitalization and punctuation. Use the answer text, not an option index or letter.

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

## Images and audio — all supported placements

- promptImage attaches one image to the question. It can be used on any card type.
- promptAudio attaches one audio recording to the question. It can be used on any card type, together with an image if needed.
- optionImages attaches images to multiple-choice options in array order. Use null where an option has no image. Text choices and an exact text correctAnswer are still required.
- There are no answer-image, answer-audio, per-matching-item media, video, PDF, or remote-image URL fields in this format.

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

The importer converts promptImage, promptAudio, and optionImages into promptImageID, promptAudioID, and optionImageIDs after uploading. Those internal ID fields belong to saved decks and the editor; do not use them in a new import. Existing saved card JSON uses a cards array, while the New deck importer expects a full deck object.

## Complete text-only deck — all five types

This is the downloadable template. It imports without selecting media files.

```json
{
  "name": "Cell Biology — All Card Types",
  "description": "Five examples covering every supported card type.",
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
- Upload controls in the card editor can add/replace prompt images, prompt audio, and option images. Save changes persists those references.
- Saved edits are validated again. A stale-save error means the deck changed; close and reopen it before retrying. Existing downloaded copies on users’ devices are not remotely overwritten.

## Common validation errors

| Error | Fix |
| --- | --- |
| Invalid JSON | Remove Markdown fences/comments/trailing commas; use double quotes. |
| Missing referenced file | Select the exact filename named by promptImage, promptAudio, or optionImages, or remove that reference. |
| Duplicate filename | Rename one file and update its reference. |
| Invalid card type | Use one of the five exact lowercase cardType values. |
| Invalid/duplicate card ID | Use a distinct non-empty string on every card, at most 64 characters. |
| Invalid multiple-choice card | Use 2–4 non-empty options and an exact matching correctAnswer. |
| Invalid matching card | Use 2–20 complete pairs with equal left/right array lengths. |
| Invalid answer images | Make optionImages an array with no more elements than options; use null for absent images. |
| Unsupported/oversized file | Export an accepted format and keep within per-file and total limits. |
| Foreign/unavailable media ID | For imports use filenames and actual files; never copy another deck’s stored media IDs. |

## AI generation prompt

Copy the following prompt and add your topic, intended level, number of cards, and desired card types.

```text
Generate one original LearnAlert deck as valid JSON only, without Markdown fences, comments, or trailing commas. Use name (1–120 chars), description (0–2000), categoryTag (1–60), colorHex (#RRGGBB), deckType (Mixed/Quiz/Vocabulary), and cards (1–500). Keep the JSON under 1 MB.
Use these exact cardType values: vocabulary (term in question, definition in correctAnswer); tap_reveal (prompt and revealed answer); multiple_choice (2–4 non-empty options; correctAnswer exactly matches an option’s text); matching (matchingLeftItems and matchingRightItems with 2–20 corresponding pairs; correctAnswer can be empty); fill_blank (___ in question; missing word/phrase in correctAnswer). Mix types only as requested.
Every card needs a unique non-empty string id (max 64 chars), cardType and non-empty question (max 5000). correctAnswer is non-empty except matching (max 10000). Optional hint max 2000 and sectionName max 120. Choice/matching strings max 5000. Omit irrelevant options/matching arrays or use [].
Optional media: promptImage: "filename.png", promptAudio: "filename.mp3", optionImages: ["choice-a.png", null, ...] in options order, with no more entries than options. Provide actual PNG/JPEG image files or MP3/M4A/WAV audio separately with exactly those filenames; reuse a filename when reusing the same file. Images max 10 MB each, audio max 20 MB each, all media max 100 MB and 1000 files per deck.
Do not include URLs, paths, base64, invented media IDs, ownership fields, status, dates, counters, sourceCommunityID, sourcePremadeID, or Course decks. There are no answer-media, per-matching-item media, video or PDF fields. If you cannot generate the actual media files, put image/audio production descriptions in a separate output outside the import JSON.
```
