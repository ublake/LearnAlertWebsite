import type { Metadata } from 'next';
import { ThemeToggle } from '@/components/theme-toggle';

export const metadata: Metadata = {
  title: 'Privacy Policy — LearnAlert',
  description: 'How LearnAlert handles private study data, AI requests, optional community accounts, and public deck sharing.',
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
      <p className="legal-meta">Last updated: October 14, 2026 · Official contact: <a href="mailto:contact@learnalertapp.com">contact@learnalertapp.com</a> · <a href="https://learnalertapp.com">learnalertapp.com</a></p>
      <p className="legal-lede">LearnAlert (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is designed from the ground up using a &ldquo;Privacy by Design&rdquo; framework. We believe that your personal study habits, notes, and academic materials should remain strictly under your control. This Privacy Policy explains private study storage, optional AI processing, and the information you choose to publish to the community.</p>

      <section className="legal-section">
        <h2><span className="legal-index">01</span>Private Study &amp; Optional Community Accounts</h2>
        <ul>
          <li><strong>No Mandatory Accounts:</strong> Personal study and browsing public decks do not require an account. Submitting, reporting, blocking authors, and managing community decks require Sign in with Apple.</li>
          <li><strong>On-Device Storage:</strong> Your personal decks, images, audio, schedules, and study progress are stored on your device. Course progress is shared locally between the app and its notification extension.</li>
          <li><strong>Private iCloud Sync:</strong> If iCloud is enabled on your Apple device, data syncs across your personal devices via Apple&rsquo;s private CloudKit database. LearnAlert cannot access, view, or read your private iCloud container.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">02</span>AI Deck Generation &amp; Sub-processor Disclosures</h2>
        <p>In accordance with Apple App Store Guideline 5.1.2(i) regarding third-party AI services:</p>

        <h3>A. What We Process</h3>
        <p>When you use the <strong>&ldquo;Import with AI&rdquo;</strong> or <strong>AI Deck Generation</strong> features, LearnAlert processes only the specific text notes, photos, or documents you explicitly paste or attach in the composer.</p>

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
        <p>AI source documents and notes are processed for the request and are not saved as community decks automatically. Our backend stores operational request metadata, including request IDs, timestamps, provider/model names, token counts, estimated or reported costs, and error status. Request logs are retained for up to seven days. Temporary diagnostic logs may include error details. If you ask to revise a deck using the original document, your device sends that document again. Third-party providers may retain request data according to their API terms.</p>
        <p>Generated cards remain in-memory drafts until you tap <strong>&ldquo;Add Deck&rdquo;</strong> to save them to your device library.</p>

        <p className="legal-callout"><strong>Important:</strong> Never submit passwords, financial records, health information, government identification, or other sensitive personal data for AI processing.</p>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">03</span>AI Transparency &amp; Educational Disclaimer</h2>
        <ul>
          <li><strong>Synthetic Content Notice:</strong> Flashcards and quizzes generated by the AI are synthetic study aids. While our system is tuned for academic accuracy, AI models may occasionally produce inaccuracies or incomplete explanations.</li>
          <li><strong>User Control &amp; Editing:</strong> You retain full editorial control to review, edit, reorganize, or delete any generated card before and after saving it to your library.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">04</span>Zero Advertising &amp; Zero Tracking</h2>
        <ul>
          <li><strong>No Third-Party Advertising:</strong> LearnAlert contains zero third-party ads.</li>
          <li><strong>No Ad Tracking (IDFA):</strong> We do not collect Apple&rsquo;s Identifier for Advertisers (IDFA) or third-party tracking identifiers.</li>
          <li><strong>No Data Brokering:</strong> We never sell, rent, license, or monetize your study materials, progress, or personal data to data brokers or marketing firms.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">05</span>Device Permissions</h2>
        <ul>
          <li><strong>Notifications:</strong> Used solely to deliver local flashcard study alerts and spaced-repetition reminders based on your scheduled preferences. Alerts are scheduled and calculated directly on your device.</li>
          <li><strong>Photos &amp; Files:</strong> Used when you choose files for the AI deck builder, attach images/audio to cards, or publish those attachments. We access only the specific files you pick using native iOS file and photo selectors.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">06</span>Public Community Sharing</h2>
        <ul>
          <li><strong>What is public:</strong> After manual approval, your deck title, description, category, cards, attached images/audio, user-chosen username, character profile, and opaque community author ID are public. Other users can browse and download editable copies. Your private source documents, study history, and personal schedules are not included.</li>
          <li><strong>Account information:</strong> We store the app-specific identifier verified from Sign in with Apple, your chosen username (or an automatically suggested default), character choices, and hashed community sessions. We do not use an Apple given name to generate your username, and do not receive your Apple password. Public author IDs do not expose the Apple identifier. Sessions expire after 30 days. When Apple token revocation is configured, encrypted refresh tokens are retained solely to manage Apple authorization and account deletion.</li>
          <li><strong>Storage providers:</strong> Cloudflare Workers processes API requests, D1 stores community profiles, sessions, deck snapshots, download-request counts, and reports, and R2 stores uploaded images/audio.</li>
          <li><strong>Manual review:</strong> Submissions remain private until an administrator approves them. Review can take up to 3 days; there is no automatic approval after that period. Author updates return approved decks to private review. Pending and rejected submissions, including their attached files, are retained until the author or administrator removes them.</li>
          <li><strong>Reports:</strong> Signed-in users may report a public deck. Reports identify the reporting account and deck and include the reason entered. Reports are reviewed by the service operator and are not public.</li>
          <li><strong>Request limits:</strong> AI request quotas store a hashed IP identifier and request counts. Expired quota windows are removed by daily cleanup. These identifiers are used to limit abuse, not for advertising.</li>
          <li><strong>Private moderation notes:</strong> Administrators may edit, hide, restore, reject, or remove community content and send a note visible to its author. These notes are not included in public browse, preview, or download responses. After an admin removes a deck, a small author-owned notice retains its ID, title, card count, note, and timestamp without cards or media. The author can dismiss it.</li>
          <li><strong>Blocking and account restrictions:</strong> Your private block list filters an author’s community content from requests made while you are signed in. Administrators may suspend or ban accounts; restricted accounts cannot use community actions, apart from signing in to inspect or delete their own account, and their decks are withheld from public access. Blocks and bans use the internal account identity so deleting and recreating a profile does not evade them. Blocking or moderation does not delete copies already downloaded to your personal library.</li>
          <li><strong>Before publishing:</strong> Share only material you have permission to publish. Do not include private information about yourself or others. Downloaded copies may remain on other users&rsquo; devices after a public deck is removed.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">07</span>Data Retention &amp; Deletion Rights</h2>
        <ul>
          <li><strong>Personal Library Deletion:</strong> You can delete individual cards, decks, or your entire local library through the app. Deleting a personal copy does not remove a separately published community copy; use Remove Public Deck for that.</li>
          <li><strong>App Removal:</strong> Uninstalling removes the app&rsquo;s local data, but does not by itself delete a public community account, published decks, or copies in iCloud or device backups.</li>
          <li><strong>Community deletion:</strong> Remove Public Deck immediately blocks public API access. Delete Community Account in the community account controls removes your profile, sessions, reports, block list, removal notices, and shared submissions. Fresh Apple sign-in may be needed to revoke Apple authorization. Retained Apple tokens are revoked or queued for retry when that service is configured; when unavailable, you can also stop using LearnAlert in Apple’s Sign in with Apple settings. Uploaded files are queued for deletion by daily cleanup; temporary failures are retried. Your personal library is retained.</li>
          <li><strong>Unfinished uploads:</strong> Abandoned, unsubmitted app drafts and unused attachments expire after 24 hours and are removed by daily cleanup. Pending/rejected submissions and admin-created drafts do not expire automatically; files still attached to retained decks do not have this 24-hour expiry.</li>
          <li><strong>Moderation retention:</strong> Deleting a profile or deck does not erase security restrictions or the administrator audit history. Audit entries may retain identifiers, reasons, notes, timestamps, and prior content snapshots used to investigate moderation actions. These records and persistent bans currently have no fixed automatic expiry. A block recorded by another user may retain the blocked account reference and last username so that their preference survives profile deletion. Encrypted tokens queued for Apple revocation are retained until successful revocation. Contact us to request a review of retained moderation records.</li>
          <li><strong>Data Portability:</strong> You can export or modify your decks freely.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">08</span>Security &amp; Encryption Standards</h2>
        <ul>
          <li><strong>In Transit:</strong> All communications between the app, our backend (<code>api.learnalertapp.com</code>), and AI sub-processors are protected using HTTPS.</li>
          <li><strong>At Rest:</strong> Personal data uses iOS device protection. Community data is stored in Cloudflare D1/R2, and access to publishing and account actions is authenticated.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">09</span>Contact Us</h2>
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
