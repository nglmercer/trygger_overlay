// Importaciones de Lit y directivas necesarias
import { LitElement, html, css,type CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { map } from 'lit/directives/map.js';
import { classMap } from 'lit/directives/class-map.js';

/**
 * Interfaz para definir la estructura de un botón de opción.
 * Esto proporciona seguridad de tipos y autocompletado.
 */
interface Option {
  label: string;
  class?: string;
  style?: string;
  callback?: (event: MouseEvent) => void;
}


// El decorador @customElement registra el componente con el nombre de etiqueta proporcionado.
// Reemplaza la necesidad de una función externa como `registerComponents`.
@customElement('c-dlg')
export class CDlg extends LitElement {
  // Las propiedades se declaran con el decorador @property.
  // Es más conciso y se integra mejor con TypeScript.
  @property({ type: String, reflect: true })
  title = '';

  @property({ type: String, reflect: true })
  description = '';
  
  // Usamos un tipo literal para restringir los valores posibles del tema.
  @property({ type: String, reflect: true })
  theme: 'light' | 'dark' = 'light';
  
  // Tipamos el array de opciones usando la interfaz que definimos.
  @property({ type: Array })
  options: Option[] = [];

  // Los estilos estáticos se definen de la misma manera, pero podemos añadir el tipo CSSResultGroup.
  static styles: CSSResultGroup = css`
    :host {
      --dlg-padding: 1.5rem;
      --dlg-border-radius: 8px;
      --dlg-font-family: system-ui, -apple-system, sans-serif;
      --dlg-title-size: 1.5rem;
      --dlg-title-weight: 600;
      --dlg-desc-size: 1rem;
      --dlg-desc-opacity: 0.8;
      --dlg-desc-max-height: 500px;
      --dlg-button-padding: 0.5rem 1rem;
      --dlg-button-radius: 4px;
      --dlg-button-font-size: 0.875rem;
      --dlg-options-gap: 0.5rem;
      --dlg-slot-margin-top: 1rem;
      --dlg-transition-speed: 0.2s;

      --dlg-text-color: #1a1a1a;
      --dlg-border-color: #e5e5e5;
      --dlg-bg-color: #ffffff;
      --dlg-button-cancel-bg: #e5e5e5;
      --dlg-button-cancel-text: #1a1a1a;
      --dlg-button-cancel-hover-bg: #d9d9d9;

      --dlg-dark-text-color: #ffffff;
      --dlg-dark-border-color: #333333;
      --dlg-dark-bg-color: #2a2a2a;
      --dlg-dark-button-cancel-bg: #444444;
      --dlg-dark-button-cancel-text: #ffffff;
      --dlg-dark-button-cancel-hover-bg: #555555;

      --dlg-button-save-bg: #007bff;
      --dlg-button-save-text: white;
      --dlg-button-save-hover-bg: #0056b3;
      --dlg-button-delete-bg: #dc3545;
      --dlg-button-delete-text: white;
      --dlg-button-delete-hover-bg: #bd2130;

      display: block;
      font-family: var(--dlg-font-family);
    }
    
    /* ... el resto de tus estilos van aquí, no necesitan cambios ... */
    .container {
      padding: var(--dlg-padding);
      border-radius: var(--dlg-border-radius);
      transition: background-color var(--dlg-transition-speed) ease, border-color var(--dlg-transition-speed) ease, color var(--dlg-transition-speed) ease;
      border: 1px solid var(--dlg-border-color);
      background-color: var(--dlg-bg-color);
      color: var(--dlg-text-color);
    }

    .container.dark {
      border-color: var(--dlg-dark-border-color);
      background-color: var(--dlg-dark-bg-color);
      color: var(--dlg-dark-text-color);
    }

    .title {
      font-size: var(--dlg-title-size);
      font-weight: var(--dlg-title-weight);
      margin: 0 0 0.5rem 0;
    }

    .description {
      font-size: var(--dlg-desc-size);
      opacity: var(--dlg-desc-opacity);
      max-height: var(--dlg-desc-max-height);
      overflow-y: auto;
      margin: 0 0 1rem 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .options {
      display: flex;
      gap: var(--dlg-options-gap);
      flex-wrap: wrap;
      margin-top: var(--dlg-padding);
      justify-content: flex-end;
    }

    ::slotted(*) {
      display: block;
      margin-top: var(--dlg-slot-margin-top);
      margin-bottom: var(--dlg-slot-margin-top);
    }

    button {
      padding: var(--dlg-button-padding);
      border-radius: var(--dlg-button-radius);
      border: none;
      cursor: pointer;
      font-size: var(--dlg-button-font-size);
      font-family: inherit;
      transition: background-color var(--dlg-transition-speed) ease, opacity var(--dlg-transition-speed) ease;
      background-color: transparent;
      color: inherit;
      border: 1px solid transparent;
    }

    button:hover {
        opacity: 0.85;
    }

    .save-btn {
      background-color: var(--dlg-button-save-bg);
      color: var(--dlg-button-save-text);
      border-color: var(--dlg-button-save-bg);
    }
    .save-btn:hover {
      background-color: var(--dlg-button-save-hover-bg);
      border-color: var(--dlg-button-save-hover-bg);
      opacity: 1;
    }

    .cancel-btn {
      background-color: var(--dlg-button-cancel-bg);
      color: var(--dlg-button-cancel-text);
      border-color: var(--dlg-button-cancel-bg);
    }
    .cancel-btn:hover {
      background-color: var(--dlg-button-cancel-hover-bg);
      border-color: var(--dlg-button-cancel-hover-bg);
      opacity: 1;
    }
    .container.dark .cancel-btn {
      background-color: var(--dlg-dark-button-cancel-bg);
      color: var(--dlg-dark-button-cancel-text);
      border-color: var(--dlg-dark-button-cancel-bg);
    }
    .container.dark .cancel-btn:hover {
      background-color: var(--dlg-dark-button-cancel-hover-bg);
      border-color: var(--dlg-dark-button-cancel-hover-bg);
    }

    .delete-btn {
      background-color: var(--dlg-button-delete-bg);
      color: var(--dlg-button-delete-text);
      border-color: var(--dlg-button-delete-bg);
    }
    .delete-btn:hover {
      background-color: var(--dlg-button-delete-hover-bg);
      border-color: var(--dlg-button-delete-hover-bg);
      opacity: 1;
    }
  `;

  render() {
    // Usamos classMap para aplicar la clase 'dark' de forma más limpia.
    const containerClasses = { container: true, [this.theme]: true };
    return html`
      <div class=${classMap(containerClasses)}>
        <h2 class="title">${this.title}</h2>
        <pre class="description">${this.description}</pre>
        <slot></slot>
        <div class="options">
          ${map(this.options, (opt, i) => 
            html`<button 
              @click=${(e: MouseEvent) => this._handleOptionClick(e, i)}
              data-index="${i}"
              class=${ifDefined(opt.class)}
              style=${ifDefined(opt.style)}
            >${opt.label}</button>`
          )}
        </div>
      </div>
    `;
  }

  // Tipamos los argumentos del método.
  private _handleOptionClick(e: MouseEvent, index: number): void {
    const option = this.options[index];
    if (option?.callback && typeof option.callback === 'function') {
      option.callback(e);
    } else {
      console.warn(`No se encontró un callback válido para la opción con índice ${index}`);
    }
  }
}

@customElement('dlg-cont')
export class DlgCont extends LitElement {
  @property({ type: Boolean, reflect: true })
  visible = false;

  @property({ type: Boolean, reflect: true })
  required = false;

  static styles: CSSResultGroup = css`
    :host {
      --dlg-overlay-bg: rgba(0, 0, 0, 0.5);
      --dlg-z-index: 1000;
      --dlg-transition-duration: 0.3s;
      --dlg-content-max-height: 90dvh;
      --dlg-content-border-radius: 16px;
      --dlg-content-padding: 8px;
      --dlg-content-bg: inherit;
      --dlg-content-color: inherit;

      display: block;
      background: inherit;
      color: inherit;
    }

    /* ... el resto de tus estilos van aquí, no necesitan cambios ... */
    .dlg-ov {
        position: fixed;
        inset: 0;
        background-color: var(--dlg-overlay-bg);

        display: flex;
        align-items: center;
        justify-content: center;

        z-index: var(--dlg-z-index);

        opacity: 0;
        visibility: hidden;

        transition: opacity var(--dlg-transition-duration) ease,
                    visibility var(--dlg-transition-duration) ease;
      }

      .dlg-cnt {
        max-height: var(--dlg-content-max-height);
        overflow-y: auto;

        background: var(--dlg-content-bg);
        color: var(--dlg-content-color);
        border-radius: var(--dlg-content-border-radius);
        padding: var(--dlg-content-padding);

        transform: scale(0.95);
        transition: transform var(--dlg-transition-duration) ease;
        transition-property: transform;
      }

      .dlg-ov.visible {
        opacity: 1;
        visibility: visible;
      }

      .dlg-ov.visible .dlg-cnt {
        transform: scale(1);
      }
  `;

  render() {
    // Usamos la directiva `classMap` para una asignación de clases más limpia.
    const overlayClasses = { 'dlg-ov': true, visible: this.visible };
    return html`
      <div class=${classMap(overlayClasses)} @click=${this._handleOverlayClick}>
        <div class="dlg-cnt">
          <slot></slot>
        </div>
      </div>
    `;
  }

  private _handleOverlayClick(e: MouseEvent): void {
    // Comprueba si el clic fue en el overlay y no en sus hijos.
    if (e.target === e.currentTarget && !this.required) {
      this.hide();
      this.emitClose();
    }
  }

  private emitClose(): void {
    this.dispatchEvent(new CustomEvent('close'));
  }

  public show(): void {
    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
  }
}

// Declaración para que TypeScript sepa que estos elementos existen en el DOM
// y pueda verificar los tipos al usarlos en plantillas HTML de otros componentes.
declare global {
  interface HTMLElementTagNameMap {
    'c-dlg': CDlg;
    'dlg-cont': DlgCont;
  }
}