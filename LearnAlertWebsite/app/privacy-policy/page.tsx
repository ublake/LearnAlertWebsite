import type { Metadata } from 'next';
import { ThemeToggle } from '@/components/theme-toggle';

export const metadata: Metadata = {
  title: 'Privacy Policy — LearnAlert',
  description: 'How LearnAlert handles personal study data, Anki imports, optional AI requests, Apple sign-in, public profiles, and shared decks.',
  alternates: { canonical: 'https://learnalertapp.com/privacy-policy' },
};

export default function PrivacyPolicy() {
  return <div className="legal-page">
    <header className="nav">
      <a className="brand" href="/"><img src="/LearnAlertLogo.png" alt="" width="34" height="34" />LearnAlert</a>
      <ThemeToggle />
    </header>
    <main className="legal">
      <p className="eyebrow"><span /> PRIVACY</p>
      <h1>Privacy Policy</h1>
      <p className="legal-meta">Last updated: November 1, 2026 · Official contact: <a href="mailto:contact@learnalertapp.com">contact@learnalertapp.com</a> · <a href="https://learnalertapp.com">learnalertapp.com</a></p>
      <p className="legal-lede">LearnAlert (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) provides personal flashcard study, study notifications, Anki package importing, optional AI generation, language topic decks, and public Shared decks. This policy explains which information stays on your device, which optional actions send information to our service or other providers, and what becomes public when you share.</p>

      <section className="legal-section">
        <h2><span className="legal-index">01</span>Private Study &amp; Optional Community Accounts</h2>
        <ul>
          <li><strong>No Mandatory Accounts:</strong> Personal study, Anki importing, and browsing public decks do not require a LearnAlert account. Submitting, reporting, blocking authors, giving hearts, and managing shared decks require Sign in with Apple.</li>
          <li><strong>On-Device Storage:</strong> Personal decks, attached images/audio, imported card layouts, schedules, answers, review ratings, due dates, and saved study sessions are stored on your device. The app and its notification extension share local storage. In-app Anki practice and notification review keep separate review histories; simply studying a card does not publish either history.</li>
          <li><strong>Private iCloud Sync:</strong> Supported library records can sync through Apple&rsquo;s private CloudKit database when iCloud is available. Some preferences, saved sessions, and attachment files remain local and may not sync. Private iCloud records are not uploaded to our shared-deck backend merely because you study or enable iCloud. Apple&rsquo;s iCloud and backup settings also apply.</li>
          <li><strong>Discover content:</strong> Browsing or downloading shared decks and language topic decks contacts our API and media storage. Downloading a shared deck increments its download-request count; the count does not represent unique people or reveal your personal study progress.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">02</span>Anki Package Imports &amp; Card Media</h2>
        <ul>
          <li><strong>Local conversion:</strong> When you select an <code>.apkg</code> file in Files, LearnAlert reads and converts the package on your device. The package, its notes, templates, tags, and embedded media are not sent to our servers or an AI provider for this conversion. LearnAlert does not request your AnkiWeb credentials or connect to your AnkiWeb account.</li>
          <li><strong>What is saved:</strong> Confirmed imports save selected cards, their front/back HTML and styling, media references, and included images/audio to your personal library. Temporary extraction files are used during conversion and LearnAlert attempts to remove them after completion or cancellation. Deleting an imported deck does not delete the original package from Files or its document provider.</li>
          <li><strong>Imported HTML:</strong> Imported templates are displayed in a separate web view with network requests, frames, form submissions, and external navigation blocked. Templates may contain local scripts for card behavior and can play included audio or request device speech. Only import files from sources you trust; not every template or add-on is supported.</li>
          <li><strong>Sharing is separate:</strong> Importing a package does not submit it to Shared decks. Public Anki-deck uploads are currently unavailable to ordinary accounts. If an authorized account submits imported content, the submitted cards, layouts, and selected media are handled under the public-sharing and review rules below.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">03</span>Optional AI Deck Generation</h2>

        <h3>A. What We Process</h3>
        <p>After you accept the AI disclosure and choose to generate or refine a deck, LearnAlert sends the text notes, photos, documents, instructions, conversation context, and draft cards included in that request. Anki file importing is a separate local feature and does not require AI processing.</p>

        <h3>B. Sub-processors</h3>
        <p>To generate smart flashcards and structured quizzes, submitted content is transmitted securely to our backend at <code>api.learnalertapp.com</code>, which forwards it to an AI provider chosen by content type:</p>
        <ul>
          <li><strong>Cheaper Inference:</strong> Processes text you paste, your chat messages, and deck refinements. Cheaper Inference is an API gateway that routes requests to underlying model providers.</li>
          <li><strong>OpenAI, Inc. (API Tier):</strong> Processes uploaded documents and photos, analyzing source text, tables, and diagrams to generate flashcard drafts.</li>
          <li><strong>Apple CloudKit (Optional):</strong> Provides optional synchronization of your personal library through your private iCloud database.</li>
        </ul>

        <h3>C. Use of Study Content</h3>
        <p>LearnAlert does not use your private study materials to train AI models. We access third-party providers through their commercial APIs; their processing and retention terms also apply to requests sent to them.</p>

        <h3>D. AI Request Storage</h3>
        <p>AI source documents and notes are processed for the request and are not saved as shared decks automatically. Our backend stores operational request metadata, including request IDs, timestamps, provider/model names, token counts, estimated or reported costs, and error status. These request records use a seven-day cleanup window; cleanup failures can delay removal. Temporary diagnostic logs may contain upstream error details or excerpts of submitted material. If you ask to revise a deck using the original document, your device sends that document again. Third-party providers may retain request data according to their API terms.</p>
        <p>Generated cards remain in-memory drafts until you tap <strong>&ldquo;Add Deck&rdquo;</strong> to save them to your device library.</p>

        <p className="legal-callout"><strong>Important:</strong> Never submit passwords, financial records, health information, government identification, or other sensitive personal data for AI processing.</p>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">04</span>AI Transparency &amp; Educational Disclaimer</h2>
        <ul>
          <li><strong>Synthetic Content Notice:</strong> Flashcards and quizzes generated by the AI are synthetic study aids. While our system is tuned for academic accuracy, AI models may occasionally produce inaccuracies or incomplete explanations.</li>
          <li><strong>User Control &amp; Editing:</strong> You retain full editorial control to review, edit, reorganize, or delete any generated card before and after saving it to your library.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">05</span>Advertising &amp; Tracking</h2>
        <ul>
          <li><strong>No Third-Party Advertising:</strong> LearnAlert contains zero third-party ads.</li>
          <li><strong>No Ad Tracking (IDFA):</strong> We do not collect Apple&rsquo;s Identifier for Advertisers (IDFA) or third-party tracking identifiers.</li>
          <li><strong>No Data Brokering:</strong> We never sell, rent, license, or monetize your study materials, progress, or personal data to data brokers or marketing firms.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">06</span>Device Permissions &amp; Service Requests</h2>
        <ul>
          <li><strong>Notifications:</strong> Used to deliver local flashcard study alerts and spaced-repetition reminders based on your scheduled preferences. Alerts are scheduled on your device. Card content may be visible on the Lock Screen or in expanded notifications according to your iOS notification settings; you can change or revoke notification permission in Settings.</li>
          <li><strong>Photos &amp; Files:</strong> Used when you select an Anki package, choose sources for the AI deck builder, or attach images/audio to cards. Native file and photo selectors grant access to the items you choose. Picking or cropping a file for a personal card does not itself publish it; AI requests and shared-deck submissions send the selected content as described above.</li>
          <li><strong>Technical request data:</strong> Our website, API, and delivery providers receive information needed to serve and protect requests, such as an IP address, requested URL, request time, and browser/app headers. Cloudflare provides hosting, network delivery, security, and storage. Visiting an external link or sending us email also involves that site or your email provider.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">07</span>Shared Decks, Profiles &amp; Hearts</h2>
        <ul>
          <li><strong>What is public:</strong> After manual approval, your deck title, description, category, cards, attached images/audio, user-chosen username, character profile, and opaque community author ID are public. Other users can browse and download editable copies. Your private source documents, study history, and personal schedules are not included.</li>
          <li><strong>Public profiles and statistics:</strong> Your public profile shows your username, character, opaque community author ID, time on LearnAlert based on your profile creation date, and approved published decks. Counts of community decks created and published, downloads, and hearts received are public by default. You can turn on <strong>Hide stats publicly</strong> in your profile to hide these aggregate profile statistics from other users. Your username, character, profile age, published deck list, and heart totals shown on individual public decks remain public.</li>
          <li><strong>Community hearts:</strong> Signed-in users can give one heart to another creator&rsquo;s published deck. We store the liking account, deck, and time of the heart. Deck heart totals are public, and the receiving creator can see the liker&rsquo;s username, character and public profile, which deck they liked, and when. Hiding your own profile statistics does not make hearts you give anonymous. Removing a heart removes that active mark and its entry in the creator&rsquo;s heart activity. The first-heart milestone used to unlock creator activity stays until the receiving creator deletes their account, even if that heart is later removed.</li>
          <li><strong>Account information:</strong> We store the app-specific identifier verified from Sign in with Apple, your chosen username (or an automatically suggested default), character choices, and hashed community sessions. We do not use an Apple given name to generate your username, and do not receive your Apple password. Public author IDs do not expose the Apple identifier. Sessions expire after 30 days. When Apple token revocation is configured, encrypted refresh tokens are retained solely to manage Apple authorization and account deletion.</li>
          <li><strong>Storage providers:</strong> Cloudflare Workers processes API requests, D1 stores community profiles, profile creation dates and privacy preferences, sessions, deck snapshots, download-request counts, reports, account/deck heart records and timestamps, and the first-heart milestone, and R2 stores uploaded images/audio.</li>
          <li><strong>Manual review:</strong> Submissions remain private until an administrator approves them. Review can take up to 3 days; there is no automatic approval after that period. Author updates return approved decks to private review. Pending and rejected submissions, including their attached files, are retained until the author or administrator removes them.</li>
          <li><strong>Reports:</strong> Signed-in users may report a public deck. Reports identify the reporting account and deck and include the reason entered. Reports are reviewed by the service operator and are not public.</li>
          <li><strong>Request limits:</strong> AI request quotas store a hashed IP identifier and request counts. Expired quota windows are removed by daily cleanup. These identifiers are used to limit abuse, not for advertising.</li>
          <li><strong>Private moderation notes:</strong> Administrators may edit, hide, restore, reject, or remove community content and send a note visible to its author. These notes are not included in public browse, preview, or download responses. After an admin removes a deck, a small author-owned notice retains its ID, title, card count, note, and timestamp without cards or media. The author can dismiss it.</li>
          <li><strong>Blocking and account restrictions:</strong> Your private block list filters an author’s community profile and decks from requests made while you are signed in. Blocks also filter heart interactions, identities, and their contribution to counts in both directions between the blocked accounts. Administrators may suspend or ban accounts; restricted accounts cannot use community actions, apart from signing in to inspect or delete their own account, and their decks are withheld from public access. Blocks and bans use the internal account identity so deleting and recreating a profile does not evade them. Blocking or moderation does not delete copies already downloaded to your personal library.</li>
          <li><strong>Before publishing:</strong> Share only material you have permission to publish. Do not include private information about yourself or others. Downloaded copies may remain on other users&rsquo; devices after a public deck is removed.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">08</span>Data Retention &amp; Deletion Rights</h2>
        <ul>
          <li><strong>Personal Library Deletion:</strong> You can delete individual cards, decks, or your local library through the app&rsquo;s library and data controls. This includes imported Anki cards and their associated local review data. Shared media folders may remain while another retained card still uses them. Deleting a personal copy does not remove a separately submitted shared copy; remove that submission through your shared-deck controls.</li>
          <li><strong>App Removal:</strong> Uninstalling removes the app&rsquo;s local data, but does not by itself delete a public community account, published decks, or copies in iCloud or device backups.</li>
          <li><strong>Community deletion:</strong> Remove Public Deck immediately blocks public API access. Delete Community Account in the community account controls removes your profile, sessions, reports, block list, removal notices, and shared submissions. Fresh Apple sign-in may be needed to revoke Apple authorization. Retained Apple tokens are revoked or queued for retry when that service is configured; when unavailable, you can also stop using LearnAlert in Apple’s Sign in with Apple settings. Uploaded files are queued for deletion by daily cleanup; temporary failures are retried. Your personal library is retained.</li>
          <li><strong>Profile and heart retention:</strong> Active heart records remain until you remove the heart, its associated community deck is deleted, or the liking account or receiving creator&rsquo;s account is deleted. Deck deletion removes its associated heart records. Account deletion removes the account&rsquo;s given hearts, hearts on its shared decks, profile creation date, privacy preference, and first-heart milestone.</li>
          <li><strong>Unfinished uploads:</strong> Abandoned, unsubmitted app drafts and unused attachments expire after 24 hours and are removed by daily cleanup. Pending/rejected submissions and admin-created drafts do not expire automatically; files still attached to retained decks do not have this 24-hour expiry.</li>
          <li><strong>Moderation retention:</strong> Deleting a profile or deck does not erase security restrictions or the administrator audit history. Audit entries may retain identifiers, reasons, notes, timestamps, and prior content snapshots used to investigate moderation actions. These records and persistent bans currently have no fixed automatic expiry. A block recorded by another user may retain the blocked account reference and last username so that their preference survives profile deletion. Encrypted tokens queued for Apple revocation are retained until successful revocation. Contact us to request a review of retained moderation records.</li>
          <li><strong>Your requests:</strong> Use the app&rsquo;s available export, editing, privacy, and deletion controls, or contact us to request access, correction, or deletion of information we hold about you. We may need to verify account ownership. An export or deletion feature may not reproduce every original Anki package feature or remove copies other people previously downloaded.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">09</span>Security &amp; Processing Providers</h2>
        <ul>
          <li><strong>In Transit:</strong> All communications between the app, our backend (<code>api.learnalertapp.com</code>), and AI sub-processors are protected using HTTPS.</li>
          <li><strong>At Rest:</strong> Personal data uses iOS device protection. Community data is stored in Cloudflare D1/R2, and access to publishing and account actions is authenticated.</li>
        </ul>
        <p>Apple, Cloudflare, and the AI providers named above process information to deliver the features you use. Their systems may process data outside your country. We do not promise that any storage or transmission system is completely secure.</p>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">10</span>Policy Updates &amp; Contact</h2>
        <p>We update this policy as features and data practices change and revise the date above. Where required, we will provide additional notice or obtain permission before a new use of your information.</p>
        <p>If you have questions, inquiries, or feedback regarding this Privacy Policy or your data rights, please contact us directly:</p>
        <p className="legal-contact"><strong>LearnAlert Support</strong></p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:contact@learnalertapp.com">contact@learnalertapp.com</a></li>
          <li><strong>Website:</strong> <a href="https://learnalertapp.com">https://learnalertapp.com</a></li>
        </ul>
      </section>
    </main>
    <footer><span>LearnAlert</span><span className="footer-links"><a className="footer-link" href="/support">Support</a><a className="footer-link" href="/terms">Terms &amp; Conditions</a><a className="footer-link" href="/">Back to home</a></span></footer>
  </div>;
}
