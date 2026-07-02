import { Search } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Input as UIInput } from "./ui/input";
import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from "react";
import {
  Combobox as UICombobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from "./ui/combobox";
import { useDebounce } from "use-debounce";

type FilterCardProps = {
  onChange: (values: Record<string, string>) => void
};

const FilterContext = createContext<((key: string, value: string) => void) | null>(null);

function useFilterContext() {
  const ctx = useContext(FilterContext);

  if (!ctx) {
    throw new Error("useFilterContext must be used insed <FilterCard>");
  }

  return ctx;
}

function Root({ onChange, children } : PropsWithChildren<FilterCardProps>) {
  const ref = useRef<Record<string, string>>({});

  function setChangeValue(name: string, value: string) {
    ref.current[name] = value;

    onChange(ref.current);
  }

  return (
    <Card className="my-4">
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <FilterContext.Provider value={setChangeValue}>
            {children}
          </FilterContext.Provider>
        </div>
      </CardContent>
    </Card>
  );
}

function Input(props: {
  name: string,
  placeholder: string
}) {
  const [value, setValue] = useState<string>("");
  const [debounceValue] = useDebounce(value, 300);
  const setChangeValue = useFilterContext();

  useEffect(() => {
    setChangeValue(props.name, debounceValue);
  }, [debounceValue]);

  function handleChange(newValue: string) {
    setValue(newValue);
  }

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <UIInput placeholder={props.placeholder} className="pl-9" value={value} onChange={(e) => handleChange(e.target.value)} />
    </div>
  );
}

function Combobox(props: {
  name: string,
  placeholder: string,
  items: string[],
}) {
  const setChangeValue = useFilterContext();

  function handleChange(value: string | null) {
    setChangeValue(props.name, value ?? "");  
  } 

  return (
    <UICombobox items={props.items} onValueChange={handleChange}>
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
    </UICombobox>
  );
}

export const FilterCard = Object.assign(Root, { Combobox, Input });
