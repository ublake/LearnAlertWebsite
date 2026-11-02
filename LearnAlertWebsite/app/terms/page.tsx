import type { Metadata } from 'next';
import { ThemeToggle } from '@/components/theme-toggle';

export const metadata: Metadata = {
  title: 'Terms and Conditions — LearnAlert',
  description: 'Terms for LearnAlert study tools, Anki imports, optional AI generation, public profiles, and shared deck submissions.',
  alternates: { canonical: 'https://learnalertapp.com/terms' },
};

export default function TermsAndConditions() {
  return <div className="legal-page">
    <header className="nav">
      <a className="brand" href="/"><img src="/LearnAlertLogo.png" alt="" width="34" height="34" />LearnAlert</a>
      <ThemeToggle />
    </header>
    <main className="legal">
      <p className="eyebrow"><span /> LEGAL</p>
      <h1>Terms and Conditions</h1>
      <p className="legal-meta">Last updated: November 1, 2026 · Official contact: <a href="mailto:contact@learnalertapp.com">contact@learnalertapp.com</a> · <a href="https://learnalertapp.com">learnalertapp.com</a></p>
      <p className="legal-lede">Welcome to <strong>LearnAlert</strong>. These Terms and Conditions (&ldquo;Terms&rdquo;) govern your use of the LearnAlert mobile application and related services (collectively, the &ldquo;Service&rdquo;) operated by LearnAlert (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By downloading, installing, or using LearnAlert, you agree to be bound by these Terms. If you do not agree, please do not use the Service.</p>

      <section className="legal-section">
        <h2><span className="legal-index">01</span>Educational Use Only &amp; No Academic Guarantee</h2>
        <ul>
          <li>LearnAlert is a supplementary study tool for personal decks, language topic decks, imported Anki cards, shared decks, and notification-based practice. Content and feature availability may change.</li>
          <li>While our systems strive for high educational quality, <strong>we make no warranties or representations regarding test scores, grades, academic admissions, or certifications</strong>.</li>
          <li>Check study material against reliable sources. Public deck approval is a moderation decision, not an endorsement of accuracy, authorship, or suitability for a particular learner.</li>
          <li>Notification delivery depends on iOS permissions, device settings, and system availability. Review ratings, due dates, and study limits support practice; they do not guarantee retention or reproduce every Anki scheduling behavior.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">02</span>Artificial Intelligence Services &amp; Disclaimer</h2>
        <ul>
          <li>LearnAlert provides automated flashcard generation using third-party artificial intelligence models, currently accessed through Cheaper Inference and OpenAI. Our AI providers may change; the current list is maintained in our Privacy Policy.</li>
          <li><strong>Synthetic Content &amp; Hallucinations:</strong> AI-generated flashcards, summaries, and explanations are produced algorithmically and may occasionally contain inaccuracies, incomplete facts, or unexpected formatting.</li>
          <li><strong>User Review:</strong> Review and verify generated cards before saving, studying, or publishing them. You choose which material to send after the AI disclosure. Our <a href="/privacy-policy">Privacy Policy</a> explains processing, providers, and retention.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">03</span>Anki Imports &amp; Compatibility</h2>
        <ul>
          <li>LearnAlert can convert supported <code>.apkg</code> files locally into a personal library. It does not sign in to AnkiWeb or sync your Anki account. LearnAlert is independent of Anki and AnkiWeb and is not endorsed by them.</li>
          <li>Only import content you have permission to use. Having a package, buying a deck, or finding it online does not necessarily grant permission to redistribute its text, images, recordings, templates, or other material.</li>
          <li>Imported layouts, scripts, fonts, image occlusion, audio, and add-on-specific features may behave differently or be unsupported. Network-dependent template resources are blocked in the card renderer. Conversion is not a guarantee of exact appearance, scheduling, or lossless round-trip export. Keep your original files and review import warnings.</li>
          <li>Importing is separate from publishing. Uploading Anki-imported decks to Shared decks is currently unsupported for ordinary accounts. Authorized exceptions remain subject to the same ownership, moderation, and acceptable-use rules; access does not confer rights to another person&rsquo;s content.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">04</span>Accounts, Profiles &amp; Privacy</h2>
        <ul>
          <li>Personal study and public browsing do not require a LearnAlert account. Shared-deck actions such as submitting, giving hearts, reporting, and blocking require Sign in with Apple. You are responsible for use of your account and for protecting access to your Apple account.</li>
          <li>Your username, generated character, profile age, and published deck list are public. Profile statistics are public by default and can be hidden using the profile privacy control. Hearts are not anonymous to the receiving creator, and individual public deck totals remain visible as described in the <a href="/privacy-policy">Privacy Policy</a>.</li>
          <li>Do not impersonate another person or misrepresent authorship. Usernames are ordinarily fixed after profile setup; authorized administrative changes may be made for moderation or support.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">05</span>Your Content &amp; Acceptable Use</h2>
        <p>When importing files, requesting AI processing, or sharing cards, images, audio, and templates:</p>
        <ul>
          <li>You retain ownership of any original study materials you submit.</li>
          <li>You must have the rights needed for the action you choose. Private study permission does not automatically include permission to send material to an AI provider or publish it to others.</li>
          <li>You agree <strong>not</strong> to submit:
            <ol className="legal-ordered">
              <li>Unlawful, abusive, hateful, harassing, exploitative, threatening, defamatory, or sexually explicit material.</li>
              <li>Personally identifiable sensitive data (e.g., passwords, credit card numbers, medical records, government IDs).</li>
              <li>Malicious code, deceptive links, stolen credentials, spam, or files designed to disrupt the Service or access another person&rsquo;s data.</li>
            </ol>
          </li>
        </ul>
        <p>Do not evade blocks or bans, manipulate hearts or downloads, bypass access or upload limits, or use automated requests to disrupt other users or the service.</p>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">06</span>Shared Decks &amp; Moderation</h2>
        <p>Shared-deck submissions stay private until manually approved. Review can take up to 3 days, with no automatic approval deadline or guarantee of acceptance. Approval makes your deck, attachments, creator name, character profile, and opaque community author ID available to others.</p>
        <p>You retain ownership of your original content. When submitting it, you grant LearnAlert a non-exclusive permission to host, copy, format, review, edit for moderation, display, and distribute the submitted version and its attachments to operate Shared decks. You also authorize other users to download and study editable personal copies. This does not transfer ownership or grant others a blanket right to republish the material.</p>
        <p>You can update or permanently remove your shared submissions and delete your community account in the app. Author updates return approved decks to private review. Pending and rejected submissions are retained until removed. Shared-deck removal deletes its database record, cards, uploaded-media records, hearts, and reports and stops new downloads. Uploaded files are deleted as part of removal or retried from a deletion queue if storage is temporarily unavailable. Your personal deck and copies other learners previously downloaded remain separate. Limited deletion, moderation, and security records may remain as described in the <a href="/privacy-policy">Privacy Policy</a>.</p>
        <p>Signed-in users can report decks, block authors from a profile&rsquo;s options, and manage their block list. A block filters community content and interactions while that viewer is signed in; it does not delete personal downloaded copies. Administrators may correct, hide, reject, or remove content and suspend or ban abusive accounts. Restrictions may survive profile deletion to prevent evasion. Private notes can explain moderation actions; removal notices can be dismissed by the author. Contact <a href="mailto:contact@learnalertapp.com">contact@learnalertapp.com</a> for moderation concerns or an appeal.</p>
        <p>If you believe shared content infringes your rights, report the deck or email us with the deck title or identifier, the work or right involved, your contact details, and enough information to assess the concern. We may restrict access while investigating. Do not submit reports you know are false.</p>
        <p>Community account deletion removes the profile, sessions, reports, submissions, block list, and removal notices, and queues attachments for cleanup. Apple reauthentication may be necessary for authorization revocation. Security restrictions and moderation audit records may remain as described in the Privacy Policy. Deleting the app alone does not delete the server-side community account.</p>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">07</span>LearnAlert &amp; Third-Party Materials</h2>
        <ul>
          <li>LearnAlert&rsquo;s original app design, code, branding, visual assets, animations, sound effects, and interface remain ours. Third-party software, symbols, imported decks, and creator materials remain subject to their respective owners&rsquo; rights and licenses.</li>
          <li>You are granted a limited, personal, non-exclusive, non-transferable, revocable license to use the app for your personal, non-commercial educational purposes.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">08</span>Availability &amp; Liability</h2>
        <p>The Service and study content are provided as available, without a promise that they will always be uninterrupted, error-free, or suitable for every purpose. Keep copies of important study files. Internet access, iCloud, AI providers, operating-system behavior, and third-party content can affect availability.</p>
        <p>To the maximum extent permitted by applicable law, in no event shall LearnAlert, its founders, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, exam failure, academic disciplinary action, or service interruptions arising out of or related to your use of the Service.</p>
        <p>Nothing in these Terms excludes liability, consumer rights, or remedies that applicable law does not allow us to exclude.</p>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">09</span>Stopping Use &amp; Account Deletion</h2>
        <p>You can stop using LearnAlert at any time. Removing the app alone does not delete your shared-deck account, published submissions, iCloud records, or other users&rsquo; downloaded copies. Use the in-app account deletion and shared-deck removal controls for server-side content, and Apple&rsquo;s settings for iCloud or backup copies. The Privacy Policy describes deletion, cleanup, and retained moderation records.</p>
        <p>We may suspend or restrict backend or community access for abuse, excessive automated requests, security concerns, or violations of these Terms. Where access is restricted, the service provides access to inspect or delete your own community account. Ownership, downloaded-copy permissions, permitted retention, and applicable liability provisions continue where relevant after you stop using the Service.</p>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">10</span>Changes to Terms</h2>
        <p>We may update these Terms as the Service changes and revise the date above. We will provide additional notice or seek agreement where required by law. Continued use after an update takes effect is subject to the updated Terms to the extent permitted by applicable law.</p>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">11</span>Contact Information</h2>
        <p>If you have questions regarding these Terms, please contact us at:</p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:contact@learnalertapp.com">contact@learnalertapp.com</a></li>
          <li><strong>Website:</strong> <a href="https://learnalertapp.com">https://learnalertapp.com</a></li>
        </ul>
      </section>
    </main>
    <footer><span>LearnAlert</span><span className="footer-links"><a className="footer-link" href="/support">Support</a><a className="footer-link" href="/privacy-policy">Privacy Policy</a><a className="footer-link" href="/">Back to home</a></span></footer>
  </div>;
}
