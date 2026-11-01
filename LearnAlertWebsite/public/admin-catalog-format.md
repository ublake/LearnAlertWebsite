# LearnAlert admin — current app content

The active workspaces are **Shared decks**, **Language decks**, and **Moderation**.

- Shared decks mirrors the public app library and provides editing, new drafts/imports, image/audio attachments, publication and activity counts. Use `admin-deck-format.md` and `admin-deck-template.json` for authored shared decks.
- Language decks contains independently saved topic decks. Use `admin-language-format.md`, `admin-language-template.json`, and `admin-language-schema.json`. Display groups organize discovery; they are not levels, checkpoints, or scheduling rules.
- Moderation retains the review queue, profiles, reports, restrictions, author notes and audit history. Public uploads need approval before appearing to other learners.

Each native card is a quiz, matching pair, fill-in-the-blank, vocabulary/reveal flashcard, or image card. Text fields can contain images and recordings without filler text. Anki import is handled by the app and is not a new authorable catalog card type.

## Safe editing

Saving a draft and publishing are separate actions. Stable IDs preserve content identity. Revision checks prevent stale editors overwriting newer changes. Publication updates Discover and future additions; existing saved learner decks, in-app study history and notification learning are not remotely reset.

Legacy exam/course APIs and stored revisions are retained for compatibility, but retired authoring controls are absent from the active navigation. Legacy language documents open read-only and require an explicit conversion preview before current-format editing. Export the original first, review any omitted retired activities, validate, and save/publish deliberately.

The protected admin remains unlinked from public navigation. Do not put secrets, login tokens, author IDs, moderation state, download/like counters, or learning/schedule data into imported card JSON. Use the existing authenticated APIs and upload actual files before referencing their catalog IDs.
