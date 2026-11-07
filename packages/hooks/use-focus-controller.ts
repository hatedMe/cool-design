import { ref, type Ref } from 'vue';
export function useFocusController(target?: Ref<HTMLElement | undefined>) {
  const isFocused = ref(false);
  const handleFocus = (event?: FocusEvent) => { isFocused.value = true; return event; };
  const handleBlur = (event?: FocusEvent) => { isFocused.value = false; return event; };
  const focus = () => target?.value?.focus();
  const blur = () => target?.value?.blur();
  return { isFocused, handleFocus, handleBlur, focus, blur };
}
