import { useState, useEffect } from "react";
import { Controller } from "react-hook-form";
import { Label } from "../ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getData } from "country-list";

// Converts a 2-letter ISO country code to its flag emoji.
// Works by mapping each letter to its regional indicator symbol (U+1F1E6–U+1F1FF).
// e.g. "US" → 🇺🇸, "BD" → 🇧🇩
const getFlagEmoji = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) return "🏳️";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const CountrySelectField = ({
  name,
  label,
  control,
  error,
  required = false,
}: CountrySelectProps) => {
  const [open, setOpen] = useState(false);
  const countryList = getData();

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="form-label">
        {label}
      </Label>

      <Controller
        control={control}
        name={name}
        rules={{
          required: required ? `Please select ${label}` : false,
        }}
        render={({ field }) => {
          // Find the selected country to display its flag + name in the trigger
          const selectedCountry = countryList.find(
            (c) => c.name === field.value
          );

          return (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger render={
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="country-select-trigger">
                  {selectedCountry ? (
                    <span className="flex items-center gap-2">
                      <span className="text-lg leading-none">
                        {getFlagEmoji(selectedCountry.code)}
                      </span>
                      <span>{selectedCountry.name}</span>
                    </span>
                  ) : (
                    <span className="text-gray-400">Select your country</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>}
              />

              <PopoverContent className="w-full p-0 bg-gray-800 border-gray-600">
                <Command className="bg-gray-800 text-white border-gray-600">
                  {/* Search input */}
                  <CommandInput
                    placeholder="Search country..."
                    className="country-select-input"
                  />
                <CommandEmpty className="py-4 text-center text-sm text-gray-400">
                      No country found.
                </CommandEmpty>

                  <CommandList className='max-h-60 bg-gray-800 scrollbar-hide-default'>
                    <CommandGroup className='bg-gray-800'>
                      {countryList.map((country: { code: string; name: string }) => (
                        <CommandItem
                          key={country.code}
                          value={country.name}
                          onSelect={(currentValue) => {
                            field.onChange(currentValue);
                            setOpen(false);
                          }}
                          className="country-select-item"
                        >
                          {/* Flag emoji derived from ISO code */}
                          <span className='flex items-center gap-2'>

                                <span>{getFlagEmoji(country.code)}</span>
                                <span>{country.name}</span>

                          </span>
                          {/* Checkmark for selected country */}
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 text-yellow-500",
                              field.value === country.name
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          );
        }}
      />

      {error && <p className="text-sm text-red-500">{error.message}</p>}
        <p className='text-xs text-gray-500'>
            Helps us show market data and news relevant to you.
        </p>
    </div>
  );
};

export default CountrySelectField;