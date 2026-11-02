/** Canonical token order is stored; shuffling belongs to the study view. */
export function tokenAnswer(options: string[], fields: Record<string, unknown>): string {
  return options.map((value, index) => {
    const entry = fields[`option:${index}`];
    const media = entry && typeof entry === 'object' ? entry as Record<string, unknown> : {};
    return value.trim() || (media.image || media.imageID ? 'Image' : media.audio || media.audioID ? 'Audio' : '');
  }).join(' ').trim();
}

/** Keep attachments with their token when inserting, removing or reordering. */
export function remapTokenFields<T>(fields: Record<string, T>, order: number[]): Record<string, T> {
  const result = Object.fromEntries(Object.entries(fields).filter(([key]) => !key.startsWith('option:')));
  order.forEach((oldIndex, newIndex) => {
    if (oldIndex < 0) return;
    const item = fields[`option:${oldIndex}`];
    if (item !== undefined) result[`option:${newIndex}`] = item;
  });
  return result;
}
