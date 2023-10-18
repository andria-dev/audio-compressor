import { LitElement, css, html } from "lit";
import { styleMap } from "lit/directives/style-map";

class ValueSlider extends LitElement {
  static formAssociated = true;
  static properties = {
    min: { type: Number, reflect: true },
    max: { type: Number, reflect: true },
    step: { type: Number, reflect: true },
    value: { type: Number, reflect: true },
  };
  static styles = css`
    :host {
      position: relative;
      display: block;
      width: fit-content;

      --thumb-width: 42px;
      --thumb-height: 24px;
      --thumb-border-width: 2px;
      --track-width: 14px;
      padding-block: calc(var(--thumb-height) / 2 + var(--thumb-border-width));
      padding-inline: calc(
        var(
          --thumb-width / 2 + var(--thumb-border-width) - var(--track-width) / 2
        )
      );
    }
    #track {
      display: block;
      width: var(--track-width);
      height: 230px;
      border-radius: 999px;
      border: solid 2px transparent;
      background: linear-gradient(135deg, #e7eff5 0%, #fff 100%) padding-box,
        linear-gradient(90deg, #c3d9ee 0%, #a1b3c4 100%) border-box;
      box-shadow: 0px 4px 9px 0px #c8d4e2 inset, 0px 3px 7px 0px #c9d3e2 inset,
        -5px -4px 5px 0px rgba(255, 255, 255, 0.75) inset;
    }
    #progress {
      position: absolute;
      width: 14px;

      border-radius: 0px 0px 66px 66px;
      background: linear-gradient(270deg, #628cb7 0%, #bfd7ec 95.89%);

      box-shadow: 19px 21px 50px 0px rgba(176, 195, 210, 0.73),
        -8px 0px 8px 0px rgba(244, 248, 251, 0.5),
        -8px -40px 22px 0px rgba(246, 251, 255, 0.38),
        -11px -11px 20px 0px rgba(255, 255, 255, 0.27);
    }
    #thumb {
      position: absolute;

      width: var(--thumb-width);
      height: var(--thumb-height);

      border-radius: 74px;
      border: var(--thumb-border-width) solid #7881e3;
      background: linear-gradient(155deg, #e4f0fa 12.66%, #fff 86.7%);
      box-shadow: 0px 16px 26px 0px #b0c3d2;
      transform: translate(-50%, calc(50% +));
    }
  `;

  #internals;
  constructor() {
    super();

    this.#internals = this.attachInternals();
    this.#internals.role = "slider";
    this.#internals.ariaOrientation = "vertical";

    if (!this.hasAttribute("tabindex")) this.tabIndex = 0;
  }

  #handleKeyUp({ key }) {
    switch (key) {
      case "ArrowRight":
      case "ArrowUp":
        break;
      case "ArrowLeft":
      case "ArrowDown":
        break;
      case "Home":
        break;
      case "End":
        break;
      case "PageUp":
        break;
      case "PageDown":
        break;
    }
  }

  render() {
    const progressPercentage = (this.value - this.min) / (this.max - this.min);

    return html`
      <div id="track" part="track"></div>
      <div
        id="progress"
        part="progress"
        style=${styleMap({
          height: CSS.percent(progressPercentage),
        })}
      ></div>
      <div
        id="thumb"
        part="thumb"
        style=${styleMap({
          "inset-block-end": CSS.percent(progressPercentage),
        })}
      ></div>
    `;
  }
}

customElements.define("value-slider", ValueSlider);
