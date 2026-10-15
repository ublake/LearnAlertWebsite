import type { Metadata } from 'next';
import { ThemeToggle } from '@/components/theme-toggle';

export const metadata: Metadata = {
  title: 'Terms and Conditions — LearnAlert',
  description: 'The Terms of Service governing your use of the LearnAlert app: educational use, AI-generated content disclaimers, acceptable use, and limitation of liability.',
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
      <p className="legal-meta">Last updated: October 14, 2026 · Official contact: <a href="mailto:contact@learnalertapp.com">contact@learnalertapp.com</a> · <a href="https://learnalertapp.com">learnalertapp.com</a></p>
      <p className="legal-lede">Welcome to <strong>LearnAlert</strong>. These Terms and Conditions (&ldquo;Terms&rdquo;) govern your use of the LearnAlert mobile application and related services (collectively, the &ldquo;Service&rdquo;) operated by LearnAlert (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By downloading, installing, or using LearnAlert, you agree to be bound by these Terms. If you do not agree, please do not use the Service.</p>

      <section className="legal-section">
        <h2><span className="legal-index">01</span>Educational Use Only &amp; No Academic Guarantee</h2>
        <ul>
          <li>LearnAlert is designed as a supplementary study and spaced-repetition tool.</li>
          <li>While our systems strive for high educational quality, <strong>we make no warranties or representations regarding test scores, grades, academic admissions, or certifications</strong>.</li>
          <li>You are solely responsible for verifying the accuracy of study materials against your official course syllabus or textbooks.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">02</span>Artificial Intelligence Services &amp; Disclaimer</h2>
        <ul>
          <li>LearnAlert provides automated flashcard generation using third-party artificial intelligence models, currently accessed through Cheaper Inference and OpenAI. Our AI providers may change; the current list is maintained in our Privacy Policy.</li>
          <li><strong>Synthetic Content &amp; Hallucinations:</strong> AI-generated flashcards, summaries, and explanations are produced algorithmically and may occasionally contain inaccuracies, incomplete facts, or unexpected formatting.</li>
          <li><strong>User Review:</strong> You are provided with full editing capabilities and are advised to review and verify all generated cards before adding them to your active study rotation. We disclaim all liability for errors or omissions in AI-generated output.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">03</span>User Content &amp; Acceptable Use</h2>
        <p>When submitting materials for AI processing or publishing cards, images, and audio:</p>
        <ul>
          <li>You retain ownership of any original study materials you submit.</li>
          <li>You represent and warrant that you have the legal right to submit such materials and that your content does not violate third-party copyright, intellectual property, or trade secrets.</li>
          <li>You agree <strong>not</strong> to submit:
            <ol className="legal-ordered">
              <li>Unlawful, abusive, harassing, defamatory, or obscene material.</li>
              <li>Personally identifiable sensitive data (e.g., passwords, credit card numbers, medical records, government IDs).</li>
              <li>Malicious code or files designed to disrupt the Service or our backend infrastructure.</li>
            </ol>
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>Community Decks</h2>
        <p>Community submissions stay private until manually approved. Review can take up to 3 days, with no automatic approval deadline. Approval makes your deck, attachments, chosen username, character profile, and opaque community author ID available to others. You retain ownership of original content and authorize LearnAlert to store, review, display, and distribute the shared copy. Share only material you have permission to publish.</p>
        <p>You can update or remove your shared submissions and delete your community account in the app. Author updates return approved decks to private review. Pending and rejected submissions are retained until removed. Removal blocks new downloads, while previously downloaded personal copies may remain.</p>
        <p>Signed-in users can report decks, block authors, and manage their block list. A block filters community content while that viewer is signed in; it does not delete personal downloaded copies. Administrators may correct, hide, reject, or remove content and suspend or ban abusive accounts. Restrictions may survive profile deletion to prevent evasion. Private notes explain moderation actions; removal notices can be dismissed by the author. Contact contact@learnalertapp.com for moderation concerns or an appeal.</p>
        <p>Community account deletion removes the profile, sessions, reports, submissions, block list, and removal notices, and queues attachments for cleanup. Apple reauthentication may be necessary for authorization revocation. Security restrictions and moderation audit records may remain as described in the Privacy Policy. Deleting the app alone does not delete the server-side community account.</p>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">04</span>Intellectual Property</h2>
        <ul>
          <li>The LearnAlert application, including its design, code, logos, visual assets, animations, sound effects, and user interface, is the property of LearnAlert and protected by intellectual property laws.</li>
          <li>You are granted a limited, personal, non-exclusive, non-transferable, revocable license to use the app for your personal, non-commercial educational purposes.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">05</span>Limitation of Liability</h2>
        <p>To the maximum extent permitted by applicable law, in no event shall LearnAlert, its founders, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, exam failure, academic disciplinary action, or service interruptions arising out of or related to your use of the Service.</p>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">06</span>Termination</h2>
        <p>You may terminate this agreement at any time simply by deleting the app from your device. We reserve the right to suspend or block access to our backend API services (such as AI generation) in cases of abuse, excessive automated requests, or violation of these Terms.</p>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">07</span>Changes to Terms</h2>
        <p>We may update these Terms from time to time. Any changes will be reflected with a revised &ldquo;Last Updated&rdquo; date on our website. Continued use of the app after such changes constitutes acceptance of the new Terms.</p>
      </section>

      <section className="legal-section">
        <h2><span className="legal-index">08</span>Contact Information</h2>
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
