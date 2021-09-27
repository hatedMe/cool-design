import { Component } from './component'

export type ButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'
export type ButtonNativeType = 'button' | 'submit' | 'reset' | 'menu'

export declare class Button extends Component {
  type: ButtonType
  plain: boolean
  round: boolean
  loading: boolean
  disabled: boolean
  icon: string
  autofocus: boolean
  nativeType: ButtonNativeType
}
