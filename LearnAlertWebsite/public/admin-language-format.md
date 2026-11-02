# Language decks — current app format

Languages contain independently saved topic decks. Learners choose a deck, add it to their library, then study it or schedule its alerts like any ordinary deck. There are no required levels, checkpoints, guides, drawing tasks, importance weights, assessments or custom activity state machines.

The compact editor follows **language → display group → topic deck → card**. Groups only organize the “More to explore” rows; they do not gate access or control scheduling. The first four non-empty topic decks, in group/deck order, appear in “Recommended decks”.

## Stable wire format

Use `presentation: "deck_collection"` and preserve existing IDs. For compatible storage, `units` means display groups and `lessons` means topic decks. This internal naming does not create course progression. Existing unknown fields remain available in JSON; do not add retired course fields to new content.

Use the downloadable `admin-language-template.json` and `admin-language-schema.json`. Every collection needs `id`, `title`, `language`, `flagEmoji`, `colorHex`, `units` and the template's compatible display defaults. `flagEmoji` is a language-page marker; the Discover flag rail is currently hidden. Every group needs a stable `id`, `title`, `unitNumber` and `lessons`. Every topic deck needs a stable `id`, `title`, `lessonNumber`, `nodeType: "lesson"`, and `cards`.

Do not put learner progress, review dates, notification settings, schedules, budgets, usernames, counters, Anki templates, `activity`, `learning`, prerequisites, guide maps, checkpoints or importance controls into authored language decks.

## Ordinary cards

Supported `cardType` values:

| Type | Authoring |
| --- | --- |
| `multipleChoice` | Quiz with 2–4 answer choices. Set `correctOptionIndex` to the zero-based right choice. |
| `matching` | 2–20 pairs in equally sized `matchingLeftItems` and `matchingRightItems`. |
| `fillBlank` | A prompt with `___`; use options and a correct index for choice-based recall, or no options for typed recall. |
| `vocabulary` | Prompt and answer for a vocabulary flashcard. |
| `tapReveal` | Prompt and answer for a general reveal card. |
| `drag_answer` | 2–30 ordered tokens in `options`, each up to 160 trimmed characters or image/audio-only. Store the correct order; the app shuffles it. No `correctOptionIndex`, matching pairs or answer attachments. |
| `images` | One front image and an optional back image. No text, audio, hints, choices or pairs. |

Native snake-case aliases `multiple_choice`, `fill_blank`, and `tap_reveal` are also understood. Prefer the template's camel-case values for language JSON. Anki cards are imported through the app's importer; they are not authored in this workspace.

Text is optional when the same prompt, answer, choice, or pair item contains real image/audio media. Media-only quiz choices use empty strings plus `correctOptionIndex`; do not insert filler labels. Vocabulary and reveal cards may use image/audio-only prompts and answers. Hints are optional; enable Hint in the editor to add text or media. Recordings play when tapped, never automatically.

## Images and audio

Upload PNG/JPEG images or MP3/M4A/WAV recordings. Images allow up to 10 MB each; audio allows up to 20 MB each. Reference uploaded assets as `catalog:UUID` owned by the same language, or preserve a supplied bundled asset name from an existing export.

Use `fieldMedia` keys `prompt`, `answer`, `hint`, `option:0`…`option:3` (`option:0`…`option:29` for Drag to Answer), `left:0`…`left:19`, and `right:0`…`right:19`. A field is `{ "image": "catalog:UUID", "audio": "catalog:UUID" }`; omit unused parts. Image cards use only prompt/answer image fields. Never invent UUIDs, claim generated descriptions are actual uploads, or reference private/foreign assets.

The editor converts old `promptImageName`, `promptAudioName`, `answerImageName`, and `optionImageNames` aliases into `fieldMedia` when changing an attachment, so stale aliases cannot override new uploads.

## Drafts and publication

Save draft retains the current live release. Validate checks the app contract. Publish updates the language's Discover catalog and future deck additions when the app refreshes. **Already saved device-local decks and their learning progress are not silently overwritten.** Archive removes an offered catalog item, while revision history and existing learner copies remain recoverable.

Older course documents open read-only. Export the original or choose Preview conversion to inspect a current-format draft. Conversion can omit unsupported activities and generate quiz/image variants. The preview shows before/after card counts and offers the original export; review every topic and card before saving. Opening a legacy document never silently converts or publishes it.

## AI instructions

Return one complete JSON language document without Markdown. Start from an exported current-format document or the template. Keep stable language, group, topic, and card IDs; assign fresh IDs only to additions. Use concise accurate prompts, meaningful distractors, repeated vocabulary in different directions, and genuine uploaded media. Keep groups decorative and decks independent. Do not reintroduce retired course features or alter learner progress. Run validation and review the draft before explicit publication.

## Drag to Answer

Use every token once in the canonical `options` order. Duplicated words are allowed. Learners tap or drag tiles, submit once, then continue; they cannot resubmit the same attempt. `correctAnswer` is derived display text. Put image/audio attachments on each token’s `option:index` slot; media must follow its token whenever the editor reorders or removes entries.
