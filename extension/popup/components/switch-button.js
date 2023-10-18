import { LitElement, css, html } from "lit";

export class SwitchButton extends LitElement {
  static formAssociated = true;

  static properties = {
    enabled: {
      type: Boolean,
      reflect: true,
    },
  };

  static styles = css`
    :host {
      --border-gradient-angle: 128deg;
      --border-gradient-first-color: #c3d9ee;
      --border-gradient-first-stop: 24%;
      --border-gradient-second-color: #a1b3c4;
      --border-gradient-second-stop: 78.3%;

      position: relative;
      display: flex;
      flex-direction: row-reverse;
      justify-content: center;
      align-items: center;
      gap: 11px;

      cursor: pointer;
      user-select: none;
      font-size: 0.875rem;
      font-family: "Nunito Sans", Arial, Helvetica, sans-serif;
      font-weight: bold;
      color: hsl(201deg 17% 34%);

      box-sizing: content-box;
      width: min-content;
      padding-block: 7px;
      padding-inline: 10px 16px;

      border-radius: 999px;
      border: solid 2px transparent;
      background: linear-gradient(149deg, #fff 16.83%, #e4f0fa 83.63%)
          padding-box,
        linear-gradient(
            var(--border-gradient-angle),
            var(--border-gradient-first-color) var(--border-gradient-first-stop),
            var(--border-gradient-second-color)
              var(--border-gradient-second-stop)
          )
          border-box;
      box-shadow: 0px 4px 9px 0px #c8d4e2,
        -5px -4px 5px 0px rgba(255, 255, 255, 0.75), 0px 3px 7px 0px #c9d3e2;

      transition: box-shadow 0.2s ease-out,
        --border-gradient-angle 0.2s ease-out,
        --border-gradient-first-color 0.2s ease-out,
        --border-gradient-first-stop 0.2s ease-out,
        --border-gradient-second-color 0.2s ease-out,
        --border-gradient-second-stop 0.2s ease-out;
    }
    :host(:hover) {
      box-shadow: 0px 4px 9px 0px rgba(200, 212, 226, 0.65),
        -5px -4px 5px 0px rgba(255, 255, 255, 0.6),
        0px 3px 7px 0px rgba(201, 211, 226, 0.65);
    }
    :host(:active) {
      box-shadow: 0px 1px 9px 0px #c8d4e2 inset, 0px 3px 7px 0px #c9d3e2 inset,
        -5px -4px 5px 0px rgba(255, 255, 255, 0.75) inset;
    }
    :host(:focus-visible) {
      outline: none;
      --border-gradient-angle: 128deg;
      --border-gradient-first-color: #949cea;
      --border-gradient-first-stop: 24%;
      --border-gradient-second-color: #7881e3;
      --border-gradient-second-stop: 78.3%;
    }

    #indicator {
      display: inline-block;
      --size: calc(18 / 14 * 1em);
      width: var(--size);
      height: var(--size);

      border-radius: 100%;
      background: linear-gradient(90deg, #ff6b59 -8.26%, #d35646 144.55%);
      box-shadow: 6px 9px 40px 0px #ff8677,
        -6px -6px 16px 0px rgba(255, 255, 255, 0.6);

      transform: rotate(90deg);
    }
    #state {
      display: inline-grid;
      grid-template-columns: 1fr;
      text-align: center;
    }
    #state slot {
      display: inline;
      grid-area: 1 / 1;
    }

    :host(:--enabled) {
      flex-direction: row;
      padding-inline: 16px 10px;
    }
    :host(:--enabled) #indicator {
      background: linear-gradient(90deg, #59ff7e -8.26%, #46d365 144.55%);
      box-shadow: 6px 9px 40px 0px #77ff85,
        -6px -6px 16px 0px rgba(255, 255, 255, 0.6);
    }
    :host(:not(:--enabled)) #state slot[name="on"] {
      opacity: 0;
    }
    :host(:--enabled) #state slot[name="off"] {
      opacity: 0;
    }

    :host(.transitioning) {
      view-transition-name: switch-button;
    }
    :host(.transitioning) #indicator {
      view-transition-name: switch-button-indicator;
    }
    :host(.transitioning) #state {
      view-transition-name: switch-button-state;
    }
  `;

  #internals;
  constructor() {
    super();

    this.#internals = this.attachInternals();
    this.#internals.role = "switch";
    this.#internals.ariaChecked = "false";

    if (!this.hasAttribute("tabindex")) this.tabIndex = 0;

    this.enabled = false;
  }

  #handleClick() {
    this.enabled = !this.enabled;
  }
  #handleKeyUp({ key }) {
    switch (key) {
      case " ":
      case "Enter":
        this.enabled = !this.enabled;
        break;
      default:
        break;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("click", this.#handleClick);
    this.addEventListener("keyup", this.#handleKeyUp);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("click", this.#handleClick);
    this.removeEventListener("keyup", this.#handleKeyUp);
  }

  willUpdate(changedProperties) {
    if (changedProperties.has("enabled")) {
      this.classList.add("transitioning");
      const viewTransition = document.startViewTransition(async () => {
        if (this.enabled) this.#internals.states.add("--enabled");
        else this.#internals.states.delete("--enabled");
        await this.updateComplete;
      });

      viewTransition.finished.then(async () => {
        this.classList.remove("transitioning");
        this.#internals.setFormValue(this.enabled ? "on" : "off", "enabled");
        this.#internals.ariaChecked = this.enabled;
        this.dispatchEvent(
          new Event("change", {
            bubbles: true,
            composed: true,
            cancelable: false,
          })
        );
      });
    }
  }
  render() {
    return html`
      <div id="state" part="state">
        <slot name="off" aria-hidden=${this.enabled}>OFF</slot>
        <slot name="on" aria-hidden=${!this.enabled}>ON</slot>
      </div>
      <div id="indicator" part="indicator"></div>
    `;
  }
}

customElements.define("switch-button", SwitchButton);
