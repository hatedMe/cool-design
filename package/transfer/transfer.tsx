import { computed, defineComponent, ref, type PropType } from 'vue';
export interface TransferItem {
  key: string | number;
  label: string;
  disabled?: boolean;
  [key: string]: unknown;
}
export default defineComponent({
  name: 'i-transfer',
  props: {
    modelValue: { type: Array as PropType<(string | number)[]>, default: () => [] },
    data: { type: Array as PropType<TransferItem[]>, default: () => [] },
    titles: { type: Array as PropType<string[]>, default: () => ['列表 1', '列表 2'] },
    filterable: Boolean,
    filterPlaceholder: { type: String, default: '请输入搜索内容' },
    buttonTexts: { type: Array as PropType<string[]>, default: () => ['上一项', '下一项'] },
    disabled: Boolean
  },
  emits: ['update:modelValue', 'change', 'left-check-change', 'right-check-change'],
  setup(props, { emit }) {
    const query = ref(['', '']);
    const checked = ref<[Set<string | number>, Set<string | number>]>([new Set(), new Set()]);
    const left = computed(() => props.data.filter((item) => !props.modelValue.includes(item.key)));
    const right = computed(() => props.data.filter((item) => props.modelValue.includes(item.key)));
    const filtered = (items: TransferItem[], side: number) =>
      items.filter((item) => !query.value[side] || item.label.toLowerCase().includes(query.value[side].toLowerCase()));
    const toggle = (side: number, key: string | number) => {
      const set = checked.value[side];
      if (set.has(key)) set.delete(key);
      else set.add(key);
      emit(side ? 'right-check-change' : 'left-check-change', [...set]);
    };
    const move = (toRight: boolean) => {
      const source = toRight ? checked.value[0] : checked.value[1];
      const values = props.modelValue.filter((key) => !(!toRight && source.has(key)));
      if (toRight) source.forEach((key) => values.push(key));
      emit('update:modelValue', values);
      emit('change', values, toRight ? 'right' : 'left', [...source]);
      source.clear();
    };
    const panel = (items: TransferItem[], side: number) => (
      <section class='i-transfer__panel'>
        <header>
          {props.titles[side]}
          <span>{items.length}</span>
        </header>
        {props.filterable && (
          <input
            value={query.value[side]}
            placeholder={props.filterPlaceholder}
            onInput={(e: Event) => (query.value[side] = (e.target as HTMLInputElement).value)}
          />
        )}
        <div class='i-transfer__items'>
          {filtered(items, side).map((item) => (
            <label key={String(item.key)}>
              <input
                type='checkbox'
                checked={checked.value[side].has(item.key)}
                disabled={props.disabled || item.disabled}
                onChange={() => toggle(side, item.key)}
              />
              {item.label}
            </label>
          ))}
        </div>
      </section>
    );
    return () => (
      <div class='i-transfer'>
        {panel(left.value, 0)}
        <div class='i-transfer__buttons'>
          <button type='button' disabled={props.disabled || checked.value[0].size === 0} onClick={() => move(true)}>
            → {props.buttonTexts[1]}
          </button>
          <button type='button' disabled={props.disabled || checked.value[1].size === 0} onClick={() => move(false)}>
            ← {props.buttonTexts[0]}
          </button>
        </div>
        {panel(right.value, 1)}
      </div>
    );
  }
});
