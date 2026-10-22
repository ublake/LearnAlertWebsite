# Language collections

A language is a collection of small topic decks. There is no lesson path, drawing, guide, checkpoint, assessment, dialogue state machine, or explanation screen.

Use the downloadable language template. Keep IDs stable when editing. The wire format retains `units` (an internal grouping) and `lessons` (topic decks) for compatibility; the app and editor show collection → decks → cards. Set `presentation` to `deck_collection`. Do not include `learning`, `activity`, `grammarNote`, `explanation`, guides, checkpoints or prerequisites.

Use mostly `multipleChoice`, plus `matching` and `fillBlank`. Short `vocabulary` flashcards are supported. Prompts should be concise: for example `la manzana` with four image choices, or an image with four Spanish words. Build repetition by asking the same vocabulary in both directions and in short sentences. Do not make a learner type Korean at the beginning.

For blank choices, put `___` into the prompt, supply two to four `options` and a `correctOptionIndex`. Selecting a choice places it into the sentence. Leave `options` empty for typed recall. Never duplicate normalized textual choices or include the answer in another equally correct form.

Every prompt, answer, choice and matching item can hold text, an image, or uploaded audio. Use `fieldMedia` keys `prompt`, `answer`, `option:0`…`option:3`, `left:0`, `right:0`, etc. Values are `{ "image": "catalog:UUID", "audio": "catalog:UUID" }`. Image-only choices use empty option strings and a correct index. Upload genuine media in the editor; never invent UUIDs or claim nonexistent images exist. Recordings play only when tapped.

New cards should progress from familiar words to short practical sentences. Use plausible distractors, clear images and repeated vocabulary, without lectures. Cards are shuffled by the regular study system. Save creates a private revision; Publish updates the public collection. Revision history and archived entries remain recoverable.
