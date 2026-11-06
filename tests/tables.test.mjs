import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createWordTable,
  mergeWordCells,
  splitWordCell,
  validateWordTable,
} from '../dist/esm/index.js';

test('merge and split preserve rectangular coverage and text', () => {
  const table = createWordTable(2, 2, [
    ['A', 'B'],
    ['C', 'D'],
  ]);
  const merged = mergeWordCells(table, { top: 0, left: 0, bottom: 1, right: 1 });
  assert.equal(merged.cells.length, 1);
  assert.equal(merged.cells[0].text, 'A\nB\nC\nD');
  assert.equal(validateWordTable(merged), true);
  const split = splitWordCell(merged, 'c0-0');
  assert.equal(split.cells.length, 4);
  assert.equal(split.cells.find((cell) => cell.row === 0 && cell.column === 0).text, 'A\nB\nC\nD');
  assert.equal(validateWordTable(split), true);
});
test('rejects nonrectangular merge ranges and overlapping grids', () => {
  const table = createWordTable(2, 2);
  assert.throws(() => mergeWordCells(table, { top: 0, left: 0, bottom: 1, right: 2 }), RangeError);
  assert.throws(
    () => validateWordTable({ ...table, cells: [...table.cells, table.cells[0]] }),
    TypeError,
  );
});
test('enforces bounded dimensions and safe split identifiers', () => {
  assert.throws(() => createWordTable(0, 1), RangeError);
  assert.equal(splitWordCell(createWordTable(1, 1), 'c0-0').cells.length, 1);
});
