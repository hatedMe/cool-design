import { withInstall } from '../../../src/utils/with-install';
import Component from './autocomplete';
import type { AutocompleteSuggestion } from './autocomplete';
export interface AutocompleteInstance {
  focus(): void;
  blur(): void;
  select(): void;
  handleSelect(item: AutocompleteSuggestion): void;
}
export const Autocomplete = withInstall<typeof Component, AutocompleteInstance>(Component);
export default Autocomplete;
export type { AutocompleteSuggestion } from './autocomplete';
