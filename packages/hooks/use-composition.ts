import { ref } from 'vue';
export function useComposition() {
  const isComposing = ref(false);
  const handleCompositionStart = () => { isComposing.value = true; };
  const handleCompositionEnd = () => { isComposing.value = false; };
  return { isComposing, handleCompositionStart, handleCompositionEnd };
}
