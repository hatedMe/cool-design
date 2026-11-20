type Channel = 'hue' | 'saturation' | 'value' | 'alpha';

export interface ColorPickerPanelInstance {
  readonly color: {
    readonly value: string;
    get(channel: Channel): number;
    set(channel: Channel, value: number): void;
    set(channels: Partial<Record<Channel, number>>): void;
    clear(): void;
    compare(other: { toRgb(): { r: number; g: number; b: number; a: number } }): boolean;
    fromString(value: string): void;
    toRgb(): { r: number; g: number; b: number; a: number };
  };
  readonly inputRef: import('../input').InputInstance | undefined;
  update(): Promise<void>;
}
