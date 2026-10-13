import { formatDocumentation } from './deck-format';

// The guide is trusted project text. Render its small Markdown subset as
// headings, tables, lists and code without interpreting HTML.
export function FormatGuide() {
  return <div className="admin-guide">{formatDocumentation.split(/(```[\s\S]*?```)/g).flatMap((part, i) => {
    if (part.startsWith('```')) return [<pre key={`${i}-code`}><code>{part.replace(/^```[^\n]*\n/, '').replace(/\n```$/, '')}</code></pre>];
    return part.split(/\n\s*\n/).filter(block => block.trim()).map((block, j) => {
      const key = `${i}-${j}`;
      const lines = block.trim().split('\n');
      if (/^#{1,3} /.test(lines[0])) return <h3 key={key}>{lines[0].replace(/^#+ /, '')}</h3>;
      if (lines[0].startsWith('|')) {
        const rows = lines.filter(line => !/^\|[\s:|-]+\|$/.test(line)).map(line => line.split('|').slice(1, -1).map(cell => cell.trim()));
        return <div className="admin-table" key={key}><table><thead><tr>{rows[0].map((cell, n) => <th key={n} scope="col">{cell}</th>)}</tr></thead><tbody>{rows.slice(1).map((row, n) => <tr key={n}>{row.map((cell, m) => <td key={m}>{cell}</td>)}</tr>)}</tbody></table></div>;
      }
      if (lines.every(line => line.startsWith('- '))) return <ul key={key}>{lines.map((line, n) => <li key={n}>{line.slice(2)}</li>)}</ul>;
      if (lines.every(line => /^\d+\. /.test(line))) return <ol key={key}>{lines.map((line, n) => <li key={n}>{line.replace(/^\d+\. /, '')}</li>)}</ol>;
      return <p key={key}>{lines.join(' ')}</p>;
    });
  })}</div>;
}
