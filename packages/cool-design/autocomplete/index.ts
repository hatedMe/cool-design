import { withInstall } from '../../../src/utils/with-install';
import type { InputInstance } from '../input';
import type { TooltipInstance } from '../tooltip';
import Component from './autocomplete';
import type { AutocompleteSuggestion } from './autocomplete';
export interface AutocompleteInstance {
  focus(): void;
  blur(): void;
  select(): void;
  handleSelect(item: AutocompleteSuggestion): Promise<void>;
  handleKeyEnter(): Promise<void>;
  getData(query: string): Promise<void>;
  highlight(index: number): void;
  close(): void;
  readonly activated: boolean;
  readonly highlightedIndex: number;
  readonly loading: boolean;
  readonly suggestions: AutocompleteSuggestion[];
  readonly inputRef: InputInstance | null | undefined;
  readonly popperRef: TooltipInstance | null | undefined;
}
export const Autocomplete = withInstall<typeof Component, AutocompleteInstance>(Component);
export default Autocomplete;
export type { AutocompleteFetchSuggestions, AutocompleteSuggestion } from './autocomplete';
