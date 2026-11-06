import {
  createWordTable,
  mergeWordCells,
  validateWordTable,
  type CellRectangle,
} from '@lp-labs/word-tables';
const table = createWordTable(2, 2, [
  ['A', 'B'],
  ['C', 'D'],
]);
const area: CellRectangle = { top: 0, left: 0, bottom: 1, right: 1 };
const merged = mergeWordCells(table, area);
console.log(validateWordTable(merged), merged.cells[0].text);
