import  type {
    InputType,
    InputReturnType,
    IInputHandler,
    InputContext,
    Option
} from './Types.ts';
import { LitElement, html, css, type PropertyValues, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { map } from 'lit/directives/map.js';
import { safeParse } from '@utils/fetch/commons/safeparse.ts';
class TextInputHandler implements IInputHandler {
    render(context: InputContext): TemplateResult {
        const inputType = context.type === 'string' ? 'text' : context.type; // Use context.type for actual type
        return html`
            <input
                class="input-element"
                type=${inputType}
                id=${ifDefined(context.id)}
                name=${ifDefined(context.name)}
                .value=${context.internalValue === null || context.internalValue === undefined ? '' : String(context.internalValue)}
                placeholder=${ifDefined(context.placeholder)}
                ?disabled=${context.disabled}
                ?readonly=${context.readonly}
                ?required=${context.required}
                minlength=${ifDefined(context.min)}
                maxlength=${ifDefined(context.max)}
                step=${ifDefined(context.step)}
                title=${ifDefined(context.title)}
                pattern=${ifDefined(context.pattern)}
                @change=${context.handleInputChange}
                @input=${(evt: Event) => this.handleInput?.(evt, context)}
            >
        `;
    }

    parseValue(val: InputReturnType): string | null {
        if (val === null || val === undefined) {
            return '';
        }
        return String(val);
    }

    handleChange(evt: Event, context: InputContext): string {
        const inputElement = evt.target as HTMLInputElement;
        return inputElement.value;
    }

    handleInput(evt: Event, context: InputContext): void {
        const inputElement = evt.target as HTMLInputElement;
        if (inputElement.pattern && !inputElement.validity.patternMismatch) {
            // If pattern exists and input is valid for pattern, no need to strip.
            // The browser handles this. If custom live stripping is needed, it's more complex.
        }
        // If you want to emit an 'input' event from CInput:
        // context.emitEvent('inputting', { value: inputElement.value });
    }

    isValid(context: InputContext): boolean {
        const inputElement = context.shadowRoot?.querySelector('.input-element') as HTMLInputElement;
        return inputElement ? inputElement.checkValidity() : true;
    }

    reset(): string {
        return '';
    }
}

// Number input handler
class NumberInputHandler implements IInputHandler {
    render(context: InputContext): TemplateResult {
        return html`
            <input
                class="input-element"
                type="number"
                id=${ifDefined(context.id)}
                name=${ifDefined(context.name)}
                .value=${context.internalValue === null || context.internalValue === undefined ? '' : String(context.internalValue)}
                placeholder=${ifDefined(context.placeholder)}
                ?disabled=${context.disabled}
                ?readonly=${context.readonly}
                ?required=${context.required}
                min=${ifDefined(context.min)}
                max=${ifDefined(context.max)}
                step=${ifDefined(context.step)}
                title=${ifDefined(context.title)}
                pattern=${ifDefined(context.pattern)}
                @change=${context.handleInputChange}
            >
        `;
    }

    parseValue(val: InputReturnType): number | null {
        if (val === '' || val === null || val === undefined) {
            return null;
        }
        const num = Number(val);
        return isNaN(num) ? null : num;
    }

    handleChange(evt: Event, context: InputContext): number | null {
        const inputElement = evt.target as HTMLInputElement;
        if (inputElement.value === '') return null;
        // valueAsNumber is preferred as it returns NaN if not a valid number
        const num = inputElement.valueAsNumber;
        return isNaN(num) ? null : num;
    }

    isValid(context: InputContext): boolean {
        const inputElement = context.shadowRoot?.querySelector('.input-element') as HTMLInputElement;
        return inputElement ? inputElement.checkValidity() : true;
    }

    reset(): null { // A number input reset to empty means its value is effectively null or NaN
        return null;
    }
}

// Textarea input handler
class TextareaInputHandler implements IInputHandler {
    render(context: InputContext): TemplateResult {
        return html`
            <textarea
                class="input-element"
                id=${ifDefined(context.id)}
                name=${ifDefined(context.name)}
                .value=${context.internalValue === null || context.internalValue === undefined ? '' : String(context.internalValue)}
                placeholder=${ifDefined(context.placeholder)}
                ?disabled=${context.disabled}
                ?readonly=${context.readonly}
                ?required=${context.required}
                minlength=${ifDefined(context.min)}
                maxlength=${ifDefined(context.max)}
                title=${ifDefined(context.title)}
                pattern=${ifDefined(context.pattern)}
                @change=${context.handleInputChange}
            ></textarea>
        `;
    }

    parseValue(val: InputReturnType): string {
        if (val === null || val === undefined) {
            return '';
        }
        return String(val);
    }

    handleChange(evt: Event, context: InputContext): string {
        const inputElement = evt.target as HTMLTextAreaElement;
        return inputElement.value;
    }

    isValid(context: InputContext): boolean {
        const inputElement = context.shadowRoot?.querySelector('.input-element') as HTMLTextAreaElement;
        return inputElement ? inputElement.checkValidity() : true;
    }

    reset(): string {
        return '';
    }
}

// Checkbox/Switch input handler
class CheckboxInputHandler implements IInputHandler {
    render(context: InputContext): TemplateResult {
        const isSwitch = context.type === 'switch';
        return html`
            <label class=${isSwitch ? "sw" : "cb-label"}>
                <input
                    class="input-element"
                    type="checkbox"
                    id=${ifDefined(context.id)}
                    name=${ifDefined(context.name)}
                    .checked=${Boolean(context.internalValue)}
                    ?disabled=${context.disabled}
                    ?readonly=${context.readonly}
                    ?required=${context.required}
                    title=${ifDefined(context.title)}
                    @change=${context.handleInputChange}
                >
                ${isSwitch ? html`<span class="sldr"></span>` : context.placeholder ? html` <span class="label-text">${context.placeholder}</span>` : ''}
            </label>
        `;
    }

    parseValue(val: InputReturnType): boolean {
        if (typeof val === 'boolean') return val;
        return String(val).toLowerCase() === 'true' || val === 'on' || val === '1';
    }

    handleChange(evt: Event, context: InputContext): boolean {
        const inputElement = evt.target as HTMLInputElement;
        return inputElement.checked;
    }

    isValid(context: InputContext): boolean {
        // Required for checkbox usually means it must be checked.
        // Standard HTML5 validation for required checkbox is a bit tricky.
        // If required, it must be checked.
        const inputElement = context.shadowRoot?.querySelector('.input-element') as HTMLInputElement;
        if (!inputElement) return true;
        if (context.required && !inputElement.checked) return false;
        return inputElement.checkValidity();
    }

    reset(): boolean {
        return false;
    }
}

// Select input handler
class SelectInputHandler implements IInputHandler {
    render(context: InputContext): TemplateResult {
        // ELIMINAMOS EL BINDING .value DEL <select>
        //console.log("context",context)
        return html`
            <select
                class="input-element"
                id=${ifDefined(context.id)}
                name=${ifDefined(context.name)}
                ?disabled=${context.disabled}
                ?readonly=${context.readonly} 
                ?required=${context.required}
                title=${ifDefined(context.title)}
                @change=${context.handleInputChange}
                ?multiple=${context.multiple}
            >
                ${context.placeholder && !context.multiple && !context.internalValue ? html`<option value="" disabled selected hidden>${context.placeholder}</option>` : ''}
                
                ${map(context.options, (opt) => {
                    let isSelected = false;
                    if (context.multiple && Array.isArray(context.internalValue)) {
                        // Comparamos siempre como strings para evitar problemas de tipo (ej. 5 vs "5")
                        isSelected = context.internalValue.includes(String(opt.value));
                    } else {
                        isSelected = String(opt.value) == String(context.internalValue ?? '');
                    }
                    return html`
                        <option value=${opt.value} ?selected=${isSelected}>
                            ${opt.label}
                        </option>
                    `;
                })}
            </select>
        `;
    }

    parseValue(val: InputReturnType, multiple: boolean = false): string | string[] {
         if (multiple) {
            if (Array.isArray(val)) { // <--- ESTA LÍNEA AHORA SE EJECUTARÁ
                return val.map(String);
            }
            if (typeof val === 'string') {
                try {
                    const parsed = safeParse(val); // Use safeParse
                    return Array.isArray(parsed) ? parsed.map(String) : (val ? [String(val)] : []);
                } catch (e) {
                    return val ? [String(val)] : [];
                }
            }
            return [];
        }
        // Single select
        if (val === null || val === undefined) {
            return '';
        }
        return String(val);
    }

    handleChange(evt: Event, context: InputContext): string | string[] {
        const selectElement = evt.target as HTMLSelectElement;
        if (context.multiple) {
            return Array.from(selectElement.selectedOptions).map(option => option.value);
        }
        return selectElement.value;
    }

    isValid(context: InputContext): boolean {
        const inputElement = context.shadowRoot?.querySelector('.input-element') as HTMLSelectElement;
        return inputElement ? inputElement.checkValidity() : true;
    }

    reset(context: InputContext): string | string[] {
        return context.multiple ? [] : '';
    }

    getSelectedOption(context: InputContext): string | null {
        const select = context.shadowRoot?.querySelector('.input-element') as HTMLSelectElement;
        if (select && !context.multiple) {
             const selectedOpt = select.options[select.selectedIndex];
             return selectedOpt ? selectedOpt.text : null;
        }
        return null; // For multiple, this is more complex
    }
}


// Radio input handler
class RadioInputHandler implements IInputHandler {
    render(context: InputContext): TemplateResult {
        return html`
            <div class="radio-group" role="radiogroup" aria-labelledby=${ifDefined(context.name && context.id ? `${context.id}-label` : undefined)}>
                ${map(context.options, (opt) => html`
                    <label class="radio-label">
                        <input
                            class="input-element"
                            type="radio"
                            id=${`${context.id || context.name}_${opt.value}`}
                            name=${ifDefined(context.name)}
                            value=${opt.value}
                            .checked=${String(opt.value) == String(context.internalValue ?? '')}
                            ?disabled=${context.disabled}
                            ?readonly=${context.readonly} 
                            ?required=${context.required}
                            title=${ifDefined(context.title)}
                            @change=${context.handleInputChange}
                        >
                        <span class="label-text">${opt.label}</span>
                    </label>
                `)}
            </div>
        `;
    }

    parseValue(val: InputReturnType): string | null {
        if (val === null || val === undefined) {
            return null;
        }
        return String(val);
    }

    handleChange(evt: Event, context: InputContext): string | null {
        // For radio, event target is the clicked radio
        const inputElement = evt.target as HTMLInputElement;
        return inputElement.checked ? inputElement.value : null; // Should always be checked if change event fires
    }

    isValid(context: InputContext): boolean {
        if (context.required) {
            const checkedRadio = context.shadowRoot?.querySelector(`input[name="${context.name}"]:checked`) as HTMLInputElement;
            return checkedRadio !== null;
        }
        return true;
    }

    reset(): null {
        // Unchecking radios programmatically is not direct.
        // The component will re-render with internalValue = null, which will uncheck them.
        return null;
    }
}

// File input handler
class FileInputHandler implements IInputHandler {
    render(context: InputContext): TemplateResult {
        return html`
            <input
                class="input-element"
                id=${ifDefined(context.id)}
                type="file"
                name=${ifDefined(context.name)}
                placeholder=${ifDefined(context.placeholder)}
                ?disabled=${context.disabled}
                ?readonly=${context.readonly}
                ?required=${context.required}
                title=${ifDefined(context.title)}
                accept=${ifDefined(context.pattern)}
                ?multiple=${context.multiple}
                @change=${context.handleInputChange}
            >
        `;
    }
    // For file, value is often the File/FileList, not just string
    parseValue(val: InputReturnType): string | File | FileList | null {
        if (val instanceof File || val instanceof FileList) return val;
        if (val === null || val === undefined) return null; // Or '' if string path is primary
        return String(val); // Fallback for string path, though not common for control
    }

    handleChange(evt: Event, context: InputContext): File | FileList | null {
        const inputElement = evt.target as HTMLInputElement;
        if (inputElement.files) {
            if (context.multiple) {
                return inputElement.files.length > 0 ? inputElement.files : null;
            }
            return inputElement.files.length > 0 ? inputElement.files[0] : null;
        }
        return null;
    }

    isValid(context: InputContext): boolean {
        const inputElement = context.shadowRoot?.querySelector('.input-element') as HTMLInputElement;
        return inputElement ? inputElement.checkValidity() : true;
    }

    reset(): null { // Resetting file input means no file selected
        return null;
    }
}

// Factory class to create input handlers
class InputHandlerFactory {
    private static handlers: Map<string, IInputHandler> = new Map();

    static {
        // Initialize handlers
        const textInputHandler = new TextInputHandler();
        this.handlers.set('text', textInputHandler);
        this.handlers.set('string', textInputHandler);
        this.handlers.set('email', textInputHandler);
        this.handlers.set('password', textInputHandler);
        this.handlers.set('tel', textInputHandler);
        this.handlers.set('url', textInputHandler);
        this.handlers.set('date', textInputHandler);
        this.handlers.set('time', textInputHandler);
        this.handlers.set('datetime-local', textInputHandler);
        this.handlers.set('color', textInputHandler);
        this.handlers.set('range', textInputHandler); // Range might need specific handling for value display

        this.handlers.set('number', new NumberInputHandler());
        this.handlers.set('textarea', new TextareaInputHandler());

        const checkboxHandler = new CheckboxInputHandler();
        this.handlers.set('checkbox', checkboxHandler);
        this.handlers.set('switch', checkboxHandler);
        this.handlers.set('boolean', checkboxHandler);

        this.handlers.set('select', new SelectInputHandler());
        this.handlers.set('radio', new RadioInputHandler());

        const fileHandler = new FileInputHandler();
        this.handlers.set('file', fileHandler);
        this.handlers.set('File', fileHandler); // Case-insensitive for convenience
    }

    static getHandler(type: InputType): IInputHandler {
        const handler = this.handlers.get(type.toLowerCase() as InputType); // Handle case variations like 'File'
        if (!handler) {
            console.warn(`Handler for input type '${type}' not found, using text handler.`);
            return this.handlers.get('text')!;
        }
        return handler;
    }

    static registerHandler(type: string, handler: IInputHandler): void {
        this.handlers.set(type.toLowerCase(), handler);
    }
}
export {
    InputHandlerFactory,
    FileInputHandler,
    TextInputHandler,
    NumberInputHandler,
    TextareaInputHandler,
    CheckboxInputHandler,
    SelectInputHandler,
    RadioInputHandler
};