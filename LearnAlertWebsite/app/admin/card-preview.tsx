'use client';
import { cardMedia, type EditableCard } from './deck-editor';

export function AdminCardPreview({ card }: { card: EditableCard }) {
  const field = (key: string, text = '') => {
    const media = cardMedia(card, key);
    return <div className="admin-preview-field">{text && <p>{text}</p>}{media.imageID && <img src={`/admin/api/media/${media.imageID}`} alt="Card attachment" />}{media.audioID && <audio controls preload="none" src={`/admin/api/media/${media.audioID}`} />}</div>;
  };
  const correct = card.correctOptionIndex ?? card.options?.indexOf(card.correctAnswer);
  return <>{field('prompt', card.question)}
    {(card.cardType === 'multiple_choice' || card.cardType === 'fill_blank' && !!card.options?.length) && card.options?.map((option, n) => <div key={n} className="admin-choice-field"><strong>{String.fromCharCode(65+n)}{correct === n ? ' ✓' : ''}</strong>{field(`option:${n}`, option)}</div>)}
    {card.cardType === 'matching' ? card.matchingLeftItems?.map((left, n) => <div key={n} className="admin-editor-grid">{field(`left:${n}`, left)}{field(`right:${n}`, card.matchingRightItems?.[n])}</div>) : !(card.cardType === 'multiple_choice' || card.cardType === 'fill_blank' && !!card.options?.length) && field('answer', card.correctAnswer)}
    {(card.hint || cardMedia(card, 'hint').imageID || cardMedia(card, 'hint').audioID) && <details><summary>Hint</summary>{field('hint', card.hint)}</details>}
    <details><summary>Card data</summary><pre>{JSON.stringify(card, null, 2)}</pre></details>
  </>;
}
