import type { Metadata } from 'next';
import { ThemeToggle } from '@/components/theme-toggle';

export const metadata: Metadata = {
  title: 'Privacy Policy — LearnAlert',
  description: 'LearnAlert is built privacy-first: no accounts, on-device storage, no ads or tracking, and AI deck generation that never trains public models on your notes.',
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
      <p className="legal-meta">Last updated: September 16, 2026 · Official contact: <a href="mailto:contact@learnalertapp.com">contact@learnalertapp.com</a> · <a href="https://learnalertapp.com">learnalertapp.com</a></p>
      <p className="legal-lede">LearnAlert (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is designed from the ground up using a &ldquo;Privacy by Design&rdquo; framework. We believe that your personal study habits, notes, and academic materials should remain strictly under your control. This Privacy Policy explains how LearnAlert handles your data, ensures compliance with Apple App Store Guidelines (including Guideline 5.1.2(i)), and safeguards your privacy.</p>

      <section className="legal-section">
        <h2><span className="legal-index">01</span>Zero-Account, Local-First Architecture</h2>
        <ul>
          <li><strong>No Mandatory Accounts:</strong> You can use LearnAlert immediately without creating an account, registering an email, or sharing personal credentials.</li>
          <li><strong>On-Device Storage:</strong> All flashcard decks, custom categories, interval schedules, streaks, and quiz accuracies are stored locally on your device via Apple SwiftData.</li>
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
          <li><strong>Cheaper Inference:</strong> Processes text you paste, your chat messages, and deck refinements. Cheaper Inference is an API gateway that routes requests to underlying model providers on a zero-retention basis.</li>
          <li><strong>OpenAI, Inc. (API Tier):</strong> Processes uploaded documents and photos, analyzing source text, tables, and diagrams to generate flashcard drafts.</li>
          <li><strong>Apple CloudKit (Optional):</strong> Provides end-to-end encrypted personal device synchronization.</li>
        </ul>

        <h3>C. The &ldquo;No-Training&rdquo; Guarantee</h3>
        <p>We access AI sub-processors strictly through commercial API agreements that prohibit using your content to train public AI foundation models. <strong>Your private notes, study materials, documents, and prompts are NOT used by our AI providers or by LearnAlert to train public AI models.</strong></p>

        <h3>D. We Do Not Store Your Study Materials</h3>
        <p>Our backend holds no database and keeps no copy of what you submit. Your notes and files exist only for the seconds it takes to process a single request, and are discarded when the response is returned. Nothing is cached or given a stored identifier. If you later ask the AI to revise a deck using the original document, your device sends that document again.</p>
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
          <li><strong>Photos &amp; Files:</strong> Used exclusively when you choose to import an image, photo, or document into the AI deck builder. We access only the specific files you pick using native iOS file and photo selectors.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">06</span>Protection of Minors (13+ / COPPA)</h2>
        <ul>
          <li>LearnAlert is designed in compliance with the Children&rsquo;s Online Privacy Protection Act (COPPA) and international child privacy frameworks.</li>
          <li>The app is intended for users aged 13 and older. Because LearnAlert does not require public profiles, social feeds, or direct user-to-user messaging, students can study in a private, distraction-free environment.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">07</span>Data Retention &amp; Deletion Rights</h2>
        <ul>
          <li><strong>Instant Hard Delete:</strong> You can delete individual cards, decks, or your entire library at any time directly within the app or via <strong>Settings &gt; Manage My Data</strong>.</li>
          <li><strong>App Removal:</strong> Uninstalling the app permanently purges all local databases and cached files from your device.</li>
          <li><strong>Data Portability:</strong> You can export or modify your decks freely.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">08</span>Security &amp; Encryption Standards</h2>
        <ul>
          <li><strong>In Transit:</strong> All communications between the app, our backend (<code>api.learnalertapp.com</code>), and AI sub-processors are encrypted using industry-standard TLS 1.3 / HTTPS encryption.</li>
          <li><strong>At Rest:</strong> Data stored on your Apple device is protected by iOS hardware-level Data Protection (AES-256).</li>
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
    <footer><span>LearnAlert</span><span className="footer-links"><a className="footer-link" href="/terms">Terms &amp; Conditions</a><a className="footer-link" href="/">Back to home</a></span></footer>
  </div>;
}
