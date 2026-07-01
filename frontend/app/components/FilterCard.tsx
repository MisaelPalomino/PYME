import { Search } from "lucide-react";
import type React from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "./ui/input";
import { useState } from "react";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "./ui/combobox";

type FilterCardItems = typeof InputFilter | typeof ComboboxFilter;

type FilterCardProps = {
  children:
  React.ReactElement<FilterCardItems> |
  React.ReactElement<FilterCardItems>[]
};

export function FilterCard({ children }: FilterCardProps) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

export function InputFilter(props: {
  placeholder: string
}) {
  const [value, setValue] = useState<string>("");

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

export function ComboboxFilter(props: {
  placeholder: string,
  items: string[],
}) {
  return (
    <Combobox items={props.items}>
      <ComboboxInput placeholder={props.placeholder} />
      <ComboboxContent>
        <ComboboxEmpty>Vacío</ComboboxEmpty>
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
