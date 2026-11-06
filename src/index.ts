export interface WordTableCell {
  id: string;
  row: number;
  column: number;
  rowSpan: number;
  columnSpan: number;
  text: string;
}
export interface WordTable {
  rows: number;
  columns: number;
  cells: WordTableCell[];
}
export interface CellRectangle {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

function checkSize(rows: number, columns: number): void {
  if (
    !Number.isSafeInteger(rows) ||
    !Number.isSafeInteger(columns) ||
    rows < 1 ||
    columns < 1 ||
    rows * columns > 100_000
  ) {
    throw new RangeError(
      'Table dimensions must be positive safe integers with at most 100,000 grid slots.',
    );
  }
}

export function createWordTable(rows: number, columns: number, values: string[][] = []): WordTable {
  checkSize(rows, columns);
  if (!Array.isArray(values) || values.length > rows)
    throw new RangeError('Cell values exceed row count.');
  const cells: WordTableCell[] = [];
  let totalText = 0;
  for (let row = 0; row < rows; row++) {
    if (values[row] && (!Array.isArray(values[row]) || values[row]!.length > columns))
      throw new RangeError('Cell values exceed column count.');
    for (let column = 0; column < columns; column++) {
      const text = values[row]?.[column] ?? '';
      if (typeof text !== 'string') throw new TypeError('Cell contents must be strings.');
      totalText += text.length;
      if (totalText > 1_000_000) throw new RangeError('Table text exceeds 1,000,000 characters.');
      cells.push({ id: `c${row}-${column}`, row, column, rowSpan: 1, columnSpan: 1, text });
    }
  }
  return { rows, columns, cells };
}

export function validateWordTable(table: WordTable): true {
  checkSize(table.rows, table.columns);
  const covered = new Set<string>();
  const ids = new Set<string>();
  let totalText = 0;
  for (const cell of table.cells) {
    if (!cell.id || ids.has(cell.id) || typeof cell.text !== 'string')
      throw new TypeError('Cells need unique ids and string text.');
    totalText += cell.text.length;
    if (totalText > 1_000_000) throw new RangeError('Table text exceeds 1,000,000 characters.');
    ids.add(cell.id);
    if (
      ![cell.row, cell.column, cell.rowSpan, cell.columnSpan].every(Number.isSafeInteger) ||
      cell.row < 0 ||
      cell.column < 0 ||
      cell.rowSpan < 1 ||
      cell.columnSpan < 1 ||
      cell.row + cell.rowSpan > table.rows ||
      cell.column + cell.columnSpan > table.columns
    )
      throw new RangeError(`Invalid cell rectangle: ${cell.id}`);
    for (let row = cell.row; row < cell.row + cell.rowSpan; row++)
      for (let column = cell.column; column < cell.column + cell.columnSpan; column++) {
        const key = `${row}:${column}`;
        if (covered.has(key)) throw new RangeError(`Overlapping cell coverage at ${key}.`);
        covered.add(key);
      }
  }
  if (covered.size !== table.rows * table.columns)
    throw new RangeError('Cells must cover the complete rectangular grid.');
  return true;
}

export function mergeWordCells(table: WordTable, rectangle: CellRectangle): WordTable {
  validateWordTable(table);
  const { top, left, bottom, right } = rectangle;
  if (
    ![top, left, bottom, right].every(Number.isSafeInteger) ||
    top < 0 ||
    left < 0 ||
    bottom < top ||
    right < left ||
    bottom >= table.rows ||
    right >= table.columns
  )
    throw new RangeError('Invalid merge rectangle.');
  const selected = table.cells
    .filter(
      (cell) =>
        cell.row >= top &&
        cell.column >= left &&
        cell.row + cell.rowSpan - 1 <= bottom &&
        cell.column + cell.columnSpan - 1 <= right,
    )
    .sort((a, b) => a.row - b.row || a.column - b.column);
  if (selected.length !== (bottom - top + 1) * (right - left + 1))
    throw new RangeError('A merge must contain complete cells and exactly fill its rectangle.');
  const first = selected.find((cell) => cell.row === top && cell.column === left);
  if (
    !first ||
    first.rowSpan !== 1 ||
    first.columnSpan !== 1 ||
    selected.some((cell) => cell.rowSpan !== 1 || cell.columnSpan !== 1)
  )
    throw new RangeError('Merges cannot partially overlap an existing merged cell.');
  const combined = selected
    .map((cell) => cell.text)
    .filter(Boolean)
    .join('\n');
  const retained: WordTableCell[] = table.cells.filter((cell) => !selected.includes(cell));
  retained.push({
    id: first.id,
    row: top,
    column: left,
    rowSpan: bottom - top + 1,
    columnSpan: right - left + 1,
    text: combined,
  });
  const result = { ...table, cells: retained.sort((a, b) => a.row - b.row || a.column - b.column) };
  validateWordTable(result);
  return result;
}

export function splitWordCell(table: WordTable, cellId: string): WordTable {
  validateWordTable(table);
  const cell = table.cells.find((candidate) => candidate.id === cellId);
  if (!cell) throw new RangeError(`Unknown cell ${cellId}.`);
  if (cell.rowSpan === 1 && cell.columnSpan === 1) return table;
  const cells = table.cells.filter((candidate) => candidate !== cell);
  for (let row = cell.row; row < cell.row + cell.rowSpan; row++)
    for (let column = cell.column; column < cell.column + cell.columnSpan; column++) {
      cells.push({
        id: row === cell.row && column === cell.column ? cell.id : `c${row}-${column}`,
        row,
        column,
        rowSpan: 1,
        columnSpan: 1,
        text: row === cell.row && column === cell.column ? cell.text : '',
      });
    }
  const result = { ...table, cells: cells.sort((a, b) => a.row - b.row || a.column - b.column) };
  validateWordTable(result);
  return result;
}
