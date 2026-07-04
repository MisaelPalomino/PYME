import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type ColumnFiltersState, type RowData, type SortingState, type Table } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { useDebounce } from "use-debounce";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from "./ui/combobox";
import Pagination from "./Pagination";

export type Filter = { columnName: string, placeholder: string } & ({
  type: "input",
} | {
  type: "combobox",
  items: string[]
});

export type TableProps<T extends RowData> = {
  data: T[],
  columns: ColumnDef<T, any>[],
  filters: Filter[],
};

function FilterInput(props: {
  name: string,
  placeholder: string,
  setChangeValue: (key: string, value: string) => void
}) {
  const [value, setValue] = useState<string>("");
  const [debounceValue] = useDebounce(value, 300);

  useEffect(() => {
    props.setChangeValue(props.name, debounceValue);
  }, [debounceValue]);

  function handleChange(newValue: string) {
    setValue(newValue);
  }

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input placeholder={props.placeholder} className="pl-9" value={value} onChange={(e) => handleChange(e.target.value)} />
    </div>
  );
}

function FilterCombobox(props: {
  name: string,
  placeholder: string,
  items: string[],
  setChangeValue: (key: string, value: string) => void
}) {
  function handleChange(value: string | null) {
    props.setChangeValue(props.name, value ?? "");
  }

  return (
    <Combobox items={props.items} onValueChange={handleChange}>
      <ComboboxInput placeholder={props.placeholder} />
      <ComboboxContent>
        <ComboboxEmpty>No encontrado.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export function TableWireframe<T extends RowData>({ data, columns, filters, children }: TableProps<T> & { children?: (table: Table<T>) => React.ReactNode }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    }
  });

  function setChangeValue(name: string, value: string) {
    console.log(`${name}: ${value}`);
    table.getColumn(name)?.setFilterValue(value);
  }

  return (
    <>
      { /* Filters */}
      {filters.length > 0 &&
        <Card className="my-4">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {filters.map(f => {
                switch (f.type) {
                  case "input":
                    return <FilterInput placeholder={f.placeholder} name={f.columnName} setChangeValue={setChangeValue} />
                  case "combobox":
                    return <FilterCombobox placeholder={f.placeholder} name={f.columnName} setChangeValue={setChangeValue} items={f.items} />
                }
              })}
            </div>
          </CardContent>
        </Card>
      }

      { /* Table */}
      {children?.(table)}

      <Pagination table={table} />
    </>
  )
}

export function TableList<T extends RowData>({ data, columns, filters }: TableProps<T>) {
  return (
    <TableWireframe columns={columns} data={data} filters={filters}>
      {
        (table) => (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm tab">
                  <thead className="border-b border-border">
                    {table.getHeaderGroups().map(group => (
                      <tr key={group.id}>
                        {group.headers.map(header => (
                          <th key={header.id} className="text-muted-foreground" style={{ width: `${header.getSize()}px` }}>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>

                  <tbody>
                    {table.getRowCount() > 0 ? (
                      table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={table.getAllLeafColumns().length}
                          className="py-8 text-center text-muted-foreground"
                        >
                          No se encontraron elementos.
                        </td>
                      </tr>
                    )
                    }
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )
      }
      { /* Table */}
    </TableWireframe>
  )
}
