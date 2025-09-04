import {
    InputHandlerFactory,
    FileInputHandler,
    TextInputHandler,
    NumberInputHandler,
    TextareaInputHandler,
    CheckboxInputHandler,
    SelectInputHandler,
    RadioInputHandler
} from './Cinput/inputs.ts'
import type {
    InputType,
    InputReturnType,
    IInputHandler,
    InputContext,
    Option
} from './Cinput/Types.ts';
import { LitElement, html, css, type PropertyValues, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { property, state } from 'lit/decorators.js';
import { safeParse } from '@utils/fetch/commons/safeparse.ts';

@customElement('c-input')
export class CInput extends LitElement {
    @property({ type: String, reflect: true }) type: InputType = 'text';
    @property({ type: String, reflect: true }) name?: string;
    @property() value?: InputReturnType | any = '';
    @property({ type: String, reflect: true }) placeholder?: string;
    @property({ type: Boolean, reflect: true }) disabled: boolean = false;
    @property({ type: Boolean, reflect: true }) readonly: boolean = false;
    @property({ type: Number, reflect: true }) min?: number; // For number: min value; for text/textarea: minlength
    @property({ type: Number, reflect: true }) max?: number; // For number: max value; for text/textarea: maxlength
    @property({ type: Number, reflect: true }) step?: number;
    @property({ type: Boolean, reflect: true }) darkmode: boolean = false;
    @property({ type: Array }) options: Option[] = [];
    @property({ type: Boolean, reflect: true }) required: boolean = false;
    @property({ type: String, reflect: true }) pattern?: string; // For text: regex; for file: accept mime types
    @property({ type: Boolean, reflect: true }) multiple: boolean = false; // For select and file

    @state() private _isValid: boolean = true;
    @state() private _internalValue?: InputReturnType;
    @state() private _currentHandler!: IInputHandler; // Will be initialized in constructor/willUpdate

    constructor() {
        super();
        this._updateHandler();
        // Initialize _internalValue from value property
        // This will be handled by willUpdate on first update too
        this._internalValue = this._parseValueForInternal(this.value);
    }

    private _updateHandler() {
        this._currentHandler = InputHandlerFactory.getHandler(this.type);
    }

    attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void {
        super.attributeChangedCallback(name, oldVal, newVal);

        if (name === 'type' && newVal !== oldVal) {
            this._updateHandler();
            // When type changes, re-parse current value if handler type changes meaning of value
            this._internalValue = this._parseValueForInternal(this.value);
        }

        if (name === 'options' && newVal !== oldVal && typeof newVal === 'string') {
            try {
                const parsedOptions = safeParse<Option[]>(newVal);
                if (Array.isArray(parsedOptions)) {
                    this.options = parsedOptions.every(opt => typeof opt === 'object' && 'value' in opt && 'label' in opt)
                        ? parsedOptions
                        : [];
                } else {
                    console.warn(`Options attribute for c-input [${this.id || this.name || 'unnamed'}] is not a valid array string. Received:`, newVal);
                    this.options = [];
                }
            } catch (e) {
                console.error(`Error parsing options attribute for c-input [${this.id || this.name || 'unnamed'}]:`, e);
                this.options = [];
            }
        }

        // This ensures that if the `value` attribute is changed externally,
        // `_internalValue` is updated accordingly. `willUpdate` handles property changes.
        if (name === 'value' && newVal !== oldVal) {
             // This path is primarily for direct attribute manipulation in HTML or setAttribute
            this._internalValue = this._parseValueForInternal(newVal);
        }
    }

    willUpdate(changedProperties: PropertyValues): void {
        if (changedProperties.has('type')) {
            this._updateHandler();
            // Re-evaluate internalValue with new handler if type changed meaning of value
            this._internalValue = this._parseValueForInternal(this.value);
        }

        if (changedProperties.has('value')) {
            // This handles programmatic changes to this.value
            const newPublicValue = changedProperties.get('value');
            // Only update _internalValue if the public `value` string representation
            // is different from what _internalValue would stringify to.
            // This avoids loops if _handleInputChange sets this.value.
            let currentInternalAsString: string;
            if (Array.isArray(this._internalValue)) {
                currentInternalAsString = JSON.stringify(this._internalValue);
            } else if (this._internalValue instanceof File || this._internalValue instanceof FileList) {
                 // For File/FileList, direct comparison of `this.value` (string) is tricky.
                 // The change usually comes from user interaction, not setting `this.value` to a file string.
                 // So, if `this.value` changes, we trust it and parse.
                 currentInternalAsString = this.value ?? ''; // Placeholder, file comparison is complex
            }
            else {
                currentInternalAsString = (this._internalValue === null || this._internalValue === undefined) ? '' : String(this._internalValue);
            }

            if (newPublicValue !== currentInternalAsString) {
                 this._internalValue = this._parseValueForInternal(this.value);
            }
        }
        
        if (changedProperties.has('options') && typeof this.options === 'string') {
             // If options are set as a string property (e.g. from framework bindings not handling arrays well)
            try {
                const parsedOptions = safeParse(this.options as any);
                 if (Array.isArray(parsedOptions)) {
                    this.options = parsedOptions.every(opt => typeof opt === 'object' && 'value' in opt && 'label' in opt)
                        ? parsedOptions
                        : [];
                } else {
                     this.options = [];
                }
            } catch(e) {
                this.options = [];
            }
        }

        if (changedProperties.has('multiple')) {
            const oldMultiple = changedProperties.get('multiple') as boolean;
            // If multiple changes, re-parse internal value
            if (this.multiple !== oldMultiple) {
                this._internalValue = this._parseValueForInternal(this.value);
            }
        }
    }

    private _parseValueForInternal(val: InputReturnType): InputReturnType {
        if (!this._currentHandler) {
            // Handler not ready, return raw or best guess (string)
            return (val === null || val === undefined) ? null : String(val);
        }
        if (this.type === 'select' && this._currentHandler instanceof SelectInputHandler) {
            return this._currentHandler.parseValue(val, this.multiple);
        }
        return this._currentHandler.parseValue(val);
    }

    private _createContext(): InputContext {
        return {
            id: this.id,
            name: this.name,
            value: this.value, // The string property value
            placeholder: this.placeholder,
            disabled: this.disabled,
            readonly: this.readonly,
            min: this.min,
            max: this.max,
            step: this.step,
            darkmode: this.darkmode,
            options: this.options,
            required: this.required,
            pattern: this.pattern,
            multiple: this.multiple,
            title: this.title,
            internalValue: this._internalValue, // The typed internal value
            shadowRoot: this.shadowRoot,
            emitEvent: (name, data) => this.EmitEvent(name, data),
            handleInputChange: (evt) => this._handleInputChange(evt),
            parseValueForInternal: (v) => this._parseValueForInternal(v),
            type: this.type // Pass type to context for handler logic if needed
        };
    }

    static styles = css`
        :host {
            display: block;
            margin-block-start: 0.5rem;
            margin-block-end: 0.5rem;
            /* Habilita herencia de color y fondo para que el componente se integre mejor. */
            color: inherit;
            background-color: transparent;

            /* --- VARIABLES DE DISEÑO --- */
            /* Colores base para Light Mode */
            --inp-text-color: #212529; /* Texto más oscuro para mejor contraste */
            --inp-bg-color: #fff;
            --inp-border-color: #ced4da; /* Gris estándar de Bootstrap, muy legible */
            --inp-border-radius: 0.375rem; /* 6px, un poco más suave */
            
            /* Colores de Foco */
            --inp-focus-border-color: #86b7fe; /* Azul de foco de Bootstrap */
            --inp-focus-shadow-color: rgba(13, 110, 253, 0.25);
            
            /* Colores de Estados */
            --inp-disabled-bg: #e9ecef;
            --inp-disabled-color: #6c757d;
            --inp-disabled-border-color: #ced4da;
            --inp-readonly-bg: #e9ecef; /* A menudo se ve igual que disabled */
            --inp-error-border-color: #dc3545; /* Rojo de error de Bootstrap */
            --inp-error-shadow-color: rgba(220, 53, 69, 0.25);

            /* Colores para el Switch */
            --inp-slider-bg: #ced4da;
            --inp-slider-knob: white;
            --inp-slider-active-bg: #0d6efd; /* Azul primario de Bootstrap */

            /* Dimensiones */
            --inp-padding: 0.5em 0.75em;
            --inp-font-size: 1rem;
            
            /* Propiedades heredables */
            font-size: var(--inp-font-size);
            font-family: inherit; /* Permite que la fuente del host se propague */
        }
        
        /* --- DARK MODE --- */
        :host([darkmode]) {
            color-scheme: dark; /* Pista clave para que el navegador use estilos oscuros por defecto */
            --inp-text-color: #dee2e6;
            --inp-bg-color: #212529;
            --inp-border-color: #495057;
            
            --inp-focus-border-color: #4dabf7;
            --inp-focus-shadow-color: rgba(77, 171, 247, 0.3);
            
            --inp-disabled-bg: #343a40;
            --inp-disabled-color: #6c757d;
            --inp-disabled-border-color: #495057;
            --inp-readonly-bg: #343a40;

            --inp-slider-bg: #495057;
            --inp-slider-knob: #adb5bd;
            --inp-slider-active-bg: #3b82f6; /* Un azul vibrante para dark mode */
        }

        /* --- Contenedor General --- */
        .inp-cont {
            display: flex;
            flex-direction: column;
        }
        
        /* --- ESTILOS GENERALES PARA INPUTS, TEXTAREA, SELECT --- */
        input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), 
        textarea, 
        select {
            padding: var(--inp-padding);
            border: 1px solid var(--inp-border-color);
            border-radius: var(--inp-border-radius);
            font-size: inherit;
            font-family: inherit;
            line-height: 1.5;
            background-color: var(--inp-bg-color);
            color: var(--inp-text-color);
            box-sizing: border-box;
            width: 100%;
            margin: 0;
            transition: border-color 0.2s, box-shadow 0.2s;
            /* Para asegurar que el navegador no ponga un fondo raro en iOS */
            -webkit-appearance: none;
            appearance: none;
        }
        
        /* Re-introducir la flecha en los selects, ya que appearance:none la quita */
        select {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 0.75rem center;
            background-size: 16px 12px;
            padding-right: 2.5rem; /* Dejar espacio para la flecha */
        }
        :host([darkmode]) select {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23dee2e6' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
        }
        
        /* Para select multiple, no queremos la flecha */
        select[multiple] {
            background-image: none;
            padding-right: var(--inp-padding); /* Resetear el padding */
            min-height: 120px; /* Un poco más de altura por defecto */
        }
        
        /* --- ESTILOS PARA LAS OPCIONES DEL SELECT --- */
        option {
            /* En modo normal, dejamos que el navegador decida los colores */
            color: initial;
            background-color: initial;
        }

        :host([darkmode]) option {
            /* En dark mode, SÍ forzamos los colores para evitar el blanco brillante */
            color: var(--inp-text-color);
            background-color: var(--inp-bg-color);
        }
        
        /* ★★★ LA CLAVE: ESTILO PARA LA OPCIÓN SELECCIONADA ★★★ */
        select option:checked {
            /* Usamos el color de foco para resaltar. !important puede ser necesario
            para sobreescribir los estilos ultra-específicos del User-Agent. */
            background-color: var(--inp-focus-border-color) !important;
            color: white !important;
        }
        
        /* --- ESTILOS DE ESTADO (DISABLED, READONLY, FOCUS, INVALID) --- */
        input:disabled, textarea:disabled, select:disabled {
            background-color: var(--inp-disabled-bg);
            color: var(--inp-disabled-color);
            border-color: var(--inp-disabled-border-color);
            cursor: not-allowed;
            /* Para selects con flecha personalizada, la quitamos en disabled */
            background-image: none;
        }

        input[readonly], textarea[readonly], select[readonly] {
            background-color: var(--inp-readonly-bg);
            cursor: default;
        }

        :host([readonly]) select {
            pointer-events: none;
        }

        input:not([disabled]):focus, textarea:not([disabled]):focus, select:not([disabled]):focus {
            outline: 0;
            border-color: var(--inp-focus-border-color);
            box-shadow: 0 0 0 0.25rem var(--inp-focus-shadow-color);
        }

        :host([invalid]) .input-element:not([type="checkbox"]):not([type="radio"]) {
            border-color: var(--inp-error-border-color) !important;
            box-shadow: 0 0 0 0.25rem var(--inp-error-shadow-color) !important;
        }

        /* --- ESTILOS PARA CHECKBOX, RADIO, SWITCH --- */
        .cb-label, .radio-label, .sw-label {
            display: inline-flex;
            align-items: center;
            gap: 0.5em; /* 'gap' es más moderno que margin-right */
            cursor: pointer;
            user-select: none;
        }

        /* Quitar el padding del contenedor para estos tipos */
        :host([type="radio"]) .inp-cont,
        :host([type="checkbox"]) .inp-cont,
        :host([type="switch"]) .inp-cont {
            padding: 0;
        }

        /* Mejorar el foco para accesibilidad */
        input[type="checkbox"]:focus-visible, 
        input[type="radio"]:focus-visible,
        .sw input:focus-visible + .sldr {
            outline: 2px solid var(--inp-focus-border-color);
            outline-offset: 2px;
            box-shadow: 0 0 0 0.25rem var(--inp-focus-shadow-color);
        }
        
        /* Switch Styles */
        .sw { position: relative; display: inline-block; width: 50px; height: 26px; flex-shrink: 0; }
        .sw input { opacity: 0; width: 0; height: 0; }
        .sldr { position: absolute; cursor: pointer; inset: 0; background-color: var(--inp-slider-bg); transition: .3s; border-radius: 26px; }
        .sldr:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: var(--inp-slider-knob); transition: .3s; border-radius: 50%; }
        input:checked + .sldr { background-color: var(--inp-slider-active-bg); }
        input:checked + .sldr:before { transform: translateX(24px); }

        /* Grupo de Radios */
        .radio-group {
            display: flex;
            flex-direction: column;
            gap: 0.75em;
        }
    `;

    render() {
        this.toggleAttribute('invalid', !this._isValid);
        // Pass the type to the host for specific styling if needed
        // this.setAttribute('type', this.type); // This is already handled by reflect: true

        return html`
            <form class="val-form" @submit="${this._handleSubmit}" novalidate>
                <div class="inp-cont">
                    ${this._currentHandler?.render(this._createContext())}
                </div>
                <button type="submit" style="display: none;"></button>
            </form>
        `;
    }

    public EmitEvent(name: string, data: unknown) {
        this.dispatchEvent(new CustomEvent(name, {
            detail: data,
            bubbles: true,
            composed: true
        }));
    }

    public _handleInputChange(evt: Event) {
        if (!this._currentHandler) return;

        const context = this._createContext(); // Create context once
        const newValueTyped = this._currentHandler.handleChange(evt, context);

        this._internalValue = newValueTyped; // Update internal state with typed value

        // Update the public 'value' property (string representation for attribute)
        if (newValueTyped instanceof File) {
            this.value = newValueTyped.name; // For single file, use name
        } else if (newValueTyped instanceof FileList) {
            this.value = Array.from(newValueTyped).map(f => f.name).join(', '); // For multiple files
        } else if (Array.isArray(newValueTyped)) {
            this.value = JSON.stringify(newValueTyped); // For select multiple
        } else if (newValueTyped === null || newValueTyped === undefined) {
            this.value = '';
        } else {
            this.value = String(newValueTyped);
        }
        
        // The change to this.value will trigger willUpdate if its value actually changed.
        // No explicit requestUpdate is typically needed here because properties _internalValue (state)
        // and value (property) are changing, which Lit tracks.

        this.EmitEvent('change', {
            id: this.id,
            name: this.name,
            value: this._internalValue, // Emit the typed internal value
            nativeEvent: evt // Pass native event if needed by consumers
        });

        this.isValid(); // Validate after updating the value, this will update _isValid state
    }

    private _handleSubmit(e: Event) {
        e.preventDefault();
        if (this.isValid()) {
            this.EmitEvent('form-submit', { id: this.id, name: this.name, value: this.getVal() });
        } else {
            // Optionally, focus the first invalid field or provide more specific feedback
            const inputElement = this._getInternalInputElement();
            if (inputElement && this._hasReportValidity(inputElement)) {
                inputElement.reportValidity();
            }
            // For radio groups, focusing the group or first radio might be better
        }
    }

    // Type guard to check if element has reportValidity method
    private _hasReportValidity(element: HTMLElement): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
        return 'reportValidity' in element && typeof (element as any).reportValidity === 'function';
    }

    private _getInternalInputElement(): HTMLElement | null {
        // For radios, there isn't a single ".input-element" but a group
        if (this.type === 'radio') {
            return this.shadowRoot?.querySelector('.radio-group input:first-of-type') as HTMLInputElement | null;
        }
        return this.shadowRoot?.querySelector('.input-element') as HTMLElement | null;
    }

    /** Returns the current value (potentially typed) */
    getVal(): InputReturnType {
        return this._internalValue;
    }

    /** Verifies input validity and updates the `invalid` attribute. */
    isValid(): boolean {
        if (!this._currentHandler) {
            this._isValid = true;
            return true;
        }
        const context = this._createContext();
        const valid = this._currentHandler.isValid(context);
        this._isValid = valid; // This is a @state property, so it will trigger a re-render
        return valid;
    }

    /** Sets the input value programmatically. */
    setVal(val: InputReturnType): void {
        this._internalValue = this._parseValueForInternal(val);

        // Update the public 'value' property string representation
        if (this._internalValue instanceof File) {
            this.value = this._internalValue.name;
        } else if (this._internalValue instanceof FileList) {
            this.value = Array.from(this._internalValue).map(f => f.name).join(', ');
        } else if (Array.isArray(this._internalValue)) {
            this.value = JSON.stringify(this._internalValue);
        } else if (this._internalValue === null || this._internalValue === undefined) {
            this.value = '';
        } else {
            this.value = String(this._internalValue);
        }
        // Request update because _internalValue (state) and value (property) have changed.
        // Lit should handle this automatically. If not, uncomment:
        // this.requestUpdate();

        // Defer validation to allow DOM to update
        // Wait for the update cycle to complete before validating
        this.updateComplete.then(() => {
            this.isValid();
            this.EmitEvent('change', { // Emit change event after programmatic setVal
                id: this.id,
                name: this.name,
                value: this._internalValue,
                programmatic: true
            });
        });
    }

    /** Resets the input to its default value (empty, false, or handler-defined). */
    reset(): void {
        if (!this._currentHandler) return;
        const context = this._createContext();
        const defaultValue = this._currentHandler.reset(context);
        this.setVal(defaultValue); // setVal will handle updates and event emission
    }

    /** Sets options for select/radio inputs. */
    setOpts(opts: Option[]): void {
        if (['select', 'radio'].includes(this.type.toLowerCase())) {
            this.options = Array.isArray(opts) ? opts : [];
            // If options change, current value might become invalid or need reassessment
            this.setVal(this._parseValueForInternal(this.value)); // Re-evaluate value with new options
        } else {
            console.warn(`setOpts is only applicable to 'select' or 'radio' types. Current type: ${this.type}`);
        }
    }

    /** Gets the display label of the selected option in a single select. */
    getSelOptLabel(): string | null {
        if (this.type === 'select' && this._currentHandler?.getSelectedOption) {
            return this._currentHandler.getSelectedOption(this._createContext());
        }
        return null;
    }
    
    focus() {
        const el = this._getInternalInputElement();
        if (el && typeof el.focus === 'function') {
            el.focus();
        }
    }

    static registerInputHandler(type: string, handler: IInputHandler): void {
        InputHandlerFactory.registerHandler(type, handler);
    }
}

