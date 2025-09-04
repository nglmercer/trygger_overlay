// Types.ts
import { type TemplateResult } from 'lit';

interface Option {
    value: string;
    label: string;
}

// Define input types
type InputType = 'text' | 'textarea' | 'select' | 'checkbox' | 'switch' | 'boolean' | 'radio' |
    'number' | 'email' | 'password' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local' | 'string' | 'File' | 'file' | 'color' | 'range';

// Remove 'object' from InputReturnType to fix the type error
type InputReturnType = string | boolean | number | string[] | null | undefined | File | FileList;

// Base interface that all input handlers must implement
interface IInputHandler {
    render(context: InputContext): TemplateResult;
    parseValue(val: InputReturnType, multiple?: boolean): InputReturnType;
    handleChange(evt: Event, context: InputContext): InputReturnType;
    handleInput?(evt: Event, context: InputContext): void; // Optional: for live input feedback
    isValid(context: InputContext): boolean;
    reset(context?: InputContext): InputReturnType;
    getSelectedOption?(context: InputContext): string | null;
}

// Context object that contains all the component properties and methods
interface InputContext {
    id?: string;
    name?: string;
    value?: string; // The string representation from the component's property
    placeholder?: string;
    disabled: boolean;
    readonly: boolean;
    min?: number;
    max?: number;
    step?: number;
    darkmode: boolean;
    options: Option[];
    required: boolean;
    pattern?: string;
    multiple: boolean;
    title?: string;
    internalValue?: InputReturnType; // Use InputReturnType consistently
    shadowRoot?: ShadowRoot | null;
    type: string; // The input type, e.g., 'text', 'number', etc.
    emitEvent: (name: string, data: unknown) => void;
    // This is the one CInput._handleInputChange
    handleInputChange: (evt: Event) => void;
    parseValueForInternal: (val: InputReturnType) => InputReturnType;
}

export type {
    InputType,
    InputReturnType,
    IInputHandler,
    InputContext,
    Option
};