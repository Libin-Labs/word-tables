# @lp-labs/word-tables

Rectangular word-processing tables with validated merge and split operations.

## Install

```sh
npm install @lp-labs/word-tables
```

## Quick start

```js
import { createWordTable, mergeWordCells, validateWordTable } from '@lp-labs/word-tables';

const table = createWordTable(2, 2, [
  ['A', 'B'],
  ['C', 'D'],
]);
const area = { top: 0, left: 0, bottom: 1, right: 1 };
const merged = mergeWordCells(table, area);
console.log(validateWordTable(merged), merged.cells[0].text);
```

## API and type contract

- `createWordTable(rows, columns, values?)` creates unique text cells; omitted values become empty strings.
- A `WordTableCell` anchors at `(row, column)` and covers positive `rowSpan × columnSpan`; all cells together must cover each grid slot exactly once.
- `mergeWordCells(table, { top, left, bottom, right })` requires a fully filled rectangle made of unmerged cells. Text is joined in row-major order with LF; the top-left id remains.
- `splitWordCell(table, cellId)` restores unit cells and retains merged text only in the top-left one. `validateWordTable(table)` returns `true` or throws.

## Bounds, errors, and supported subset

Dimensions are positive safe integers with at most 100,000 grid slots; total cell text is capped at 1,000,000 characters. Invalid table/cell objects throw `TypeError`; out-of-grid, incomplete, overlapping, or partial-merge rectangles throw `RangeError`. This is a fixed rectangular, text-only grid; insertion/deletion of rows or columns, nested tables, rich cell runs, and layout are excluded. Validation and merge/split work are bounded by the grid size.

## Customization and limitations

Keep table-level row/column policy in the caller and perform edits against returned tables so invalid intermediate grids are never exposed. Convert rich cell content explicitly to/from plain strings.

## Module formats

ESM, CommonJS, and TypeScript declarations are included. CommonJS: `const api = require('@lp-labs/word-tables')`. There are no runtime or peer dependencies; TypeScript and Prettier are development-only.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
