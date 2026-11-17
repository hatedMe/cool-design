import { computed, defineComponent, nextTick, ref, watch, type PropType } from 'vue';
import { useField } from '../form/context';
import { useConfig, type Size } from '../config-provider/context';
import Icon from '../icon';

export type InputTagTrigger = 'Enter' | 'Space';
export type InputTagTagType = 'primary' | 'success' | 'info' | 'warning' | 'danger';
export type InputTagTagEffect = 'light' | 'dark' | 'plain';

export default defineComponent({
  name: 'i-input-tag',
  props: {
    modelValue: Array as PropType<string[]>,
    max: Number,
    tagType: { type: String as PropType<InputTagTagType>, default: 'info' },
    tagEffect: { type: String as PropType<InputTagTagEffect>, default: 'light' },
    trigger: { type: String as PropType<InputTagTrigger>, default: 'Enter' },
    draggable: Boolean,
    delimiter: [String, RegExp] as PropType<string | RegExp>,
    size: String as PropType<Size>,
    collapseTags: Boolean,
    collapseTagsTooltip: Boolean,
    maxCollapseTags: { type: Number, default: 1 },
    saveOnBlur: { type: Boolean, default: true },
    clearable: Boolean,
    clearIcon: [String, Object],
    disabled: Boolean,
    validateEvent: { type: Boolean, default: true },
    readonly: Boolean,
    autofocus: Boolean,
    id: String,
    tabindex: [String, Number],
    maxlength: [String, Number],
    minlength: [String, Number],
    placeholder: String,
    autocomplete: { type: String, default: 'off' }
  },
  emits: ['update:modelValue', 'change', 'input', 'add-tag', 'remove-tag', 'drag-tag', 'focus', 'blur', 'clear'],
  setup(props, { emit, slots, expose }) {
    const field = useField();
    const config = useConfig();
    const input = ref<HTMLInputElement>();
    const draft = ref('');
    const dragIndex = ref<number>();
    const innerValue = ref<string[]>(props.modelValue ?? []);

    watch(
      () => props.modelValue,
      (value) => {
        innerValue.value = value ?? [];
      }
    );
    const tags = computed(() => innerValue.value);
    const isDisabled = () => props.disabled || !!field?.disabled?.();
    const isReadonly = () => props.readonly;

    const commit = (next: string[]) => {
      innerValue.value = next;
      emit('update:modelValue', next);
      emit('change', next);
      if (props.validateEvent) nextTick(() => field?.validate('change'));
    };
    const addTag = (value: string) => {
      const text = value.trim();
      if (!text) return false;
      if (props.max !== undefined && tags.value.length >= props.max) return false;
      emit('add-tag', text);
      commit([...tags.value, text]);
      return true;
    };
    const removeTag = (index: number) => {
      if (isDisabled() || isReadonly()) return;
      const value = tags.value[index];
      emit('remove-tag', value);
      commit(tags.value.filter((_, itemIndex) => itemIndex !== index));
    };
    const clear = () => {
      if (isDisabled() || isReadonly()) return;
      commit([]);
      emit('clear');
    };

    const onInput = (event: Event) => {
      const value = (event.target as HTMLInputElement).value;
      emit('input', value);
      if (props.delimiter) {
        const matched = value.match(props.delimiter instanceof RegExp ? props.delimiter : new RegExp(props.delimiter));
        if (matched?.index !== undefined) {
          const before = value.slice(0, matched.index);
          if (addTag(before)) {
            draft.value = value.slice(matched.index + matched[0].length);
            nextTick(() => {
              if (input.value) input.value.value = draft.value;
            });
            return;
          }
        }
      }
      draft.value = value;
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Backspace' && !draft.value && tags.value.length) {
        event.preventDefault();
        removeTag(tags.value.length - 1);
        return;
      }
      const isTrigger =
        (props.trigger === 'Enter' && event.key === 'Enter') ||
        (props.trigger === 'Space' && (event.key === ' ' || event.code === 'Space'));
      if (isTrigger) {
        event.preventDefault();
        if (addTag(draft.value)) {
          draft.value = '';
          if (input.value) input.value.value = '';
        }
      }
    };
    const onBlur = (event: FocusEvent) => {
      if (props.saveOnBlur && !isDisabled() && !isReadonly() && addTag(draft.value)) {
        draft.value = '';
        if (input.value) input.value.value = '';
      }
      emit('blur', event);
      if (props.validateEvent) nextTick(() => field?.validate('blur'));
    };

    const onDragStart = (index: number) => (event: DragEvent) => {
      dragIndex.value = index;
      event.dataTransfer?.setData('text/plain', String(index));
    };
    const onDrop = (index: number) => (event: DragEvent) => {
      event.preventDefault();
      const from = dragIndex.value;
      dragIndex.value = undefined;
      if (from === undefined || from === index) return;
      const next = [...tags.value];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      emit('drag-tag', moved);
      commit(next);
    };

    expose({
      focus: () => input.value?.focus(),
      blur: () => input.value?.blur()
    });

    return () => {
      const shown = props.collapseTags ? tags.value.slice(0, Math.max(0, props.maxCollapseTags)) : tags.value;
      const rest = tags.value.length - shown.length;
      return (
        <div
          class={[
            'i-input-tag',
            `i-control--${props.size ?? field?.size?.() ?? config.value.size}`,
            { 'is-disabled': isDisabled(), 'is-readonly': isReadonly() }
          ]}
          id={props.id ?? field?.id}
          aria-invalid={field?.invalid() ? 'true' : undefined}
          aria-describedby={field?.invalid() ? field.errorId : undefined}>
          {slots.prefix?.()}
          {shown.map((value, index) => (
            <span
              key={`${value}-${index}`}
              class={['i-input-tag__tag', `is-${props.tagType}`, `is-${props.tagEffect}`]}
              draggable={props.draggable && !isDisabled() && !isReadonly()}
              onDragstart={onDragStart(index)}
              onDragover={(event: DragEvent) => event.preventDefault()}
              onDrop={onDrop(index)}>
              {slots.tag?.({ value }) ?? value}
              {!isDisabled() && !isReadonly() && (
                <button
                  type='button'
                  class='i-input-tag__remove'
                  aria-label={`移除 ${value}`}
                  onClick={() => removeTag(index)}>
                  ×
                </button>
              )}
            </span>
          ))}
          {rest > 0 && (
            <span
              class='i-input-tag__more'
              title={props.collapseTagsTooltip ? tags.value.join(', ') : undefined}>
              +{rest}
            </span>
          )}
          <input
            ref={input}
            class='i-input-tag__input'
            value={draft.value}
            placeholder={props.placeholder}
            disabled={isDisabled()}
            readonly={isReadonly()}
            autofocus={props.autofocus}
            tabindex={props.tabindex}
            maxlength={props.maxlength}
            minlength={props.minlength}
            autocomplete={props.autocomplete}
            onInput={onInput}
            onKeydown={onKeydown}
            onFocus={(event: FocusEvent) => emit('focus', event)}
            onBlur={onBlur}
          />
          {slots.suffix?.()}
          {props.clearable && tags.value.length > 0 && !isDisabled() && !isReadonly() && (
            <button type='button' class='i-input-tag__clear' aria-label='清空' onClick={clear}>
              {props.clearIcon ? <Icon icon={props.clearIcon} aria-hidden='true' /> : '×'}
            </button>
          )}
        </div>
      );
    };
  }
});
