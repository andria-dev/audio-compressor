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
		@property --progress {
			syntax: "<percentage>";
			inherits: true;
			initial-value: 50%;
		}

		:host {
			display: block;
			width: fit-content;

			--thumb-width: 42px;
			--thumb-height: 24px;
			--thumb-border-width: 2px;
			--half-thumb-height: calc(var(--thumb-height) / 2 - var(--thumb-border-width));

			--track-width: 14px;
			--track-border-width: 2px;

			padding-block: calc(var(--thumb-height) / 2 + var(--thumb-border-width));
			padding-inline: calc(var(--thumb-width) / 2 + var(--thumb-border-width) - var(--track-width) / 2);
		}
		#wrapper {
			position: relative;
			width: fit-content;
		}
		#track-border {
			width: fit-content;
			border-radius: 999px;
			padding: var(--track-border-width);
			background: linear-gradient(90deg, #c3d9ee 0%, #a1b3c4 100%);
			box-shadow:
				0px 4px 9px 0px #c8d4e2 inset,
				0px 3px 7px 0px #c9d3e2 inset,
				-5px -4px 5px 0px rgba(255, 255, 255, 0.75) inset;
		}
		#track {
			width: var(--track-width);
			box-sizing: border-box;
			height: 209px;
			border-radius: 999px;
			background: linear-gradient(135deg, #e7eff5 0%, #fff 100%);
		}
		#progress {
			pointer-events: none;
			position: absolute;
			inset-inline-start: 0;
			inset-block-end: 0;

			inline-size: 14px;
			block-size: var(--progress);

			border-radius: 66px;
			background: linear-gradient(270deg, #628cb7 0%, #bfd7ec 95.89%);

			box-shadow:
				19px 21px 50px 0px rgba(176, 195, 210, 0.73),
				-8px 0px 8px 0px rgba(244, 248, 251, 0.5),
				-8px -40px 22px 0px rgba(246, 251, 255, 0.38),
				-11px -11px 20px 0px rgba(255, 255, 255, 0.27);
		}
		#thumb {
			position: absolute;
			inset-inline-start: calc(50% - var(--thumb-width) / 2 - var(--thumb-border-width));
			inset-block-end: calc(var(--progress) - var(--half-thumb-height));

			inline-size: var(--thumb-width);
			block-size: var(--thumb-height);

			border-radius: 74px;
			border: var(--thumb-border-width) solid #7881e3;
			background: linear-gradient(155deg, #e4f0fa 12.66%, #fff 86.7%);
			box-shadow: 0px 16px 26px 0px #b0c3d2;
		}
		#track-border:has(#thumb:hover) {
			cursor: grab;
		}
		#track-border:has(:is(#thumb, #track):active) {
			cursor: grabbing;
		}
		.transition-all {
			transition: 0.1s ease-out;
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

	connectedCallback() {
		super.connectedCallback();
		this.shadowRoot.addEventListener("pointerdown", this.#handlePointerDown);
	}
	disconnectedCallback() {
		super.disconnectedCallback();
		this.shadowRoot.removeEventListener("pointerup", this.#handlePointerDown);
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

	#valueToPercentage(value) {
		return (value - this.min) / (this.max - this.min);
	}
	#percentageToOffset(percentage) {
		return Math.round((this.max - this.min) * percentage);
	}
	#offsetToPosition(offset) {
		const rect = this.shadowRoot.querySelector("#track").getBoundingClientRect();
		return rect.y + rect.height - offset;
	}
	#positionToOffset(position) {
		const rect = this.shadowRoot.querySelector("#track").getBoundingClientRect();
		return rect.y + rect.height - Math.max(rect.y, Math.min(position, rect.y + rect.height));
	}
	#offsetToPercentage(offset) {
		const rect = this.shadowRoot.querySelector("#track").getBoundingClientRect();
		return offset / rect.height;
	}
	#percentageToValue(percentage) {
		return percentage * (this.max - this.min) + this.min;
	}
	#stepValue(value) {
		let stepValue = Math.round(value / this.step) * this.step;

		const stepParts = this.step.toString().split(".");
		if (stepParts.length === 2) stepValue = parseFloat(stepValue.toFixed(stepParts[1].length));
		return stepValue;
	}

	#state = "idle";
	#context = {}
	#updateState(type, payload = null) {
		switch (this.#state) {
			case "idle": {
				if (type === "BEGIN_DRAG") {
					this.#state = "dragging";
					window.addEventListener("pointermove", this.#handlePointerMove);
					window.addEventListener("pointerup", this.#handlePointerUp);
					document.documentElement.classList.add("dragging");
				}
				break;
			}
			case "dragging": {
				if (type === "UPDATE_DRAG_POSITION") {
					this.value = this.#stepValue(this.#percentageToValue(this.#offsetToPercentage(this.#positionToOffset(payload.y))));
				} else if (type === "END_DRAG") {
					this.#state = "idle";
					window.removeEventListener("pointermove", this.#handlePointerMove);
					window.removeEventListener("pointerup", this.#handlePointerUp);
					document.documentElement.classList.remove("dragging");
				}
				break;
			}
		}
	}
	/**
	 * @param {PointerEvent} event
	 */
	#handlePointerDown = (event) => {
		event.preventDefault();
		if (event.target.id === "thumb") {
			const thumbRect = this.shadowRoot.querySelector("#thumb").getBoundingClientRect();
			this.#updateState("BEGIN_DRAG", { thumbOffset: event.clientY - thumbRect.y + thumbRect.height / 2 });
		} else if (event.target.id === "track") {
			this.#updateState("BEGIN_DRAG");
			this.#handlePointerMove(event);
		}
	};
	/**
	 * @param {PointerEvent} event
	 */
	#handlePointerMove = (event) => {
		event.preventDefault();
		this.#updateState("UPDATE_DRAG_POSITION", { x: event.clientX, y: event.clientY });
	};
	/**
	 * @param {PointerEvent} event
	 */
	#handlePointerUp = (event) => {
		event.preventDefault();
		this.#updateState("END_DRAG");
	};

	render() {
		return html`
			<div
				id="track-border"
				style=${styleMap({
					"--progress": this.#valueToPercentage(this.value) * 100 + "%",
				})}
			>
				<div id="wrapper">
					<div id="track" part="track"></div>
					<div id="progress" part="progress"></div>
					<div id="thumb" part="thumb"></div>
				</div>
			</div>
		`;
	}
}

customElements.define("value-slider", ValueSlider);
