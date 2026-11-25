import React, { useId } from 'react';

export interface TableColumn<T> {
  key: string;
  label: string;
  isRowHeader?: boolean;
  align?: 'left' | 'right' | 'center';
  render: (row: T) => React.ReactNode;
}

interface ResponsiveTableProps<T> {
  caption: string;
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyText?: string;
}

export function ResponsiveTable<T>({
  caption,
  columns,
  rows,
  rowKey,
  emptyText = 'Tidak ada data tersedia.',
}: ResponsiveTableProps<T>) {
  const captionId = useId();

  return (
    <div tabIndex={0} role="region" aria-labelledby={captionId} className="table-wrapper scroller">
      <table>
        <caption id={captionId}>{caption}</caption>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-6 text-center text-xs text-[var(--text-secondary)]">
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((col, idx) => {
                  const isHeader = col.isRowHeader ?? idx === 0;
                  const alignCls =
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
                  if (isHeader) {
                    return (
                      <th key={col.key} scope="row" className={alignCls}>
                        {col.render(row)}
                      </th>
                    );
                  }
                  return (
                    <td key={col.key} data-label={col.label} className={alignCls}>
                      {col.render(row)}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
