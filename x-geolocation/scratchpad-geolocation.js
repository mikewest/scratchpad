class ScratchpadGeolocation extends HTMLElement {
  static LOCATION_EVENT = "location";
 
  static PRECISION_ATTRIBUTE = "precise";
  static REPETITION_ATTRIBUTE = "watch";
  static PERSISTENCE_ATTRIBUTE = "persistent";

  static Precision = {
    PRECISE: "precise",
    COARSE: "coarse"
  };

  static Repetition = {
    REPEATED: "repeated",
    ONCE: "once"
  };

  static Persistence = {
    PER_SITE: "per site",
    PER_VISIT: "per visit",
  };

  #userHasSeenAndAcceptedTheDialog = false;
  #precision   = ScratchpadGeolocation.Precision.COARSE;
  #repetition  = ScratchpadGeolocation.Repetition.ONCE;
  #persistence = ScratchpadGeolocation.Persistence.PER_VISIT;

  #demoData = {
    precise: { latitude: -33.856159, longitude: 151.215256 }, // Sydney Opera House
    coarse: { latitude: -33.87, longitude: 151.21 }, // Sydneyish
  };

  constructor() {
    super();
  }

  connectedCallback() {
    this.#precision = this.hasAttribute(ScratchpadGeolocation.PRECISION_ATTRIBUTE) ?
      ScratchpadGeolocation.Precision.PRECISE :
      ScratchpadGeolocation.Precision.COARSE;

    this.#repetition = this.hasAttribute(ScratchpadGeolocation.REPETITION_ATTRIBUTE) ?
      ScratchpadGeolocation.Repetition.REPEATED :
      ScratchpadGeolocation.Repetition.ONCE;

    this.#persistence = this.hasAttribute(ScratchpadGeolocation.PERSISTENCE_ATTRIBUTE) ?
      ScratchpadGeolocation.Persistence.PER_SITE :
      ScratchpadGeolocation.Persistence.PER_VISIT;

    this.buildElement();
    this.shadowRoot.querySelector('button').addEventListener('click', _ => { this.handleClick() });
  }

  buildElement() {
    const root = this.attachShadow({ mode: "open" });
  
    const style = document.createElement('style');
    style.textContent = `
      button {
        display: inline-block;
        padding: 1rem;
        background-color: #0BF;
        color: white;
        border-radius: 8px;
        cursor: pointer;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transition: background-color 0.3s ease;
        font-size: 1.25em;
        text-align: center;
      }

      button:hover {
        background-color: #0CF;
      }

      button:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      button img {
        height: 1.25rem;
        vertical-align: text-top;
        margin-right: 0.25rem;
      }

      dialog {
        border-radius: 8px;
        border: 0px;
        font-size: 0.8rem;
        width: 325px;
        padding: 0.5rem 0;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
      }
        dialog::backdrop {
          background: rgba(0, 0, 0, 0.5);
        }
        dialog p {
          text-align: center;
          margin: 0.5em 1em;
        }
        dialog p:first-child {
          font-weight: bold;
          font-size: 1rem;
        }
        dialog img {
          display: block;
          width: 100%;
        }
        dialog button {
          min-width: 90%;
          background-color: #D3E3FD;
          border: 0;
          color: #051D49;
          margin: 0.55em auto;
          padding: 0.5em;
          display: block;
          font-size: 1rem;
        }
          dialog button:hover {
            background-color: #C8D7F0;
          }
    `;

    const button = document.createElement('button');

    const img = document.createElement('img');
    img.src = "https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/my_location/default/24px.svg";
    button.appendChild(img);

    let buttonString = `
      Share your ${this.#persistence === ScratchpadGeolocation.Persistence.PER_SITE ? "" : "current"}
      ${this.#precision === ScratchpadGeolocation.Precision.PRECISE ? "precise" : ""}
      location ${this.#persistence === ScratchpadGeolocation.Persistence.PER_SITE ? "when visiting this site" : ""}
    `;

    const txt = document.createTextNode(buttonString);
    button.appendChild(txt);

    root.appendChild(style);
    root.appendChild(button);
  }

  updateLocation() {
    this.dispatchEvent(
      new CustomEvent(ScratchpadGeolocation.LOCATION_EVENT, {
        detail: this.#demoData[this.#precision]
      }));
  }

  disposeOfDialog(dialog, dismissed) {
    dialog.close();
    this.shadowRoot.removeChild(dialog);
    if (dismissed) {
      this.dispatchEvent(
        new CustomEvent(ScratchpadGeolocation.LOCATION_EVENT, {
          detail: { dismissed: true }
        }));
    }
  }

  acceptDialog(dialog) {
    this.#userHasSeenAndAcceptedTheDialog = true;
    this.disposeOfDialog(dialog, false);
    this.updateLocation();
    if (this.#repetition === ScratchpadGeolocation.Repetition.REPEATED) {
      setInterval(_ => { this.updateLocation() }, 1000);
    }
  }

  handleClick() {
    if (this.#userHasSeenAndAcceptedTheDialog) {
      this.updateLocation();
    } else {
      const dialog = document.createElement('dialog');

      const titleString = `<p>This website
          ${
            this.#persistence === ScratchpadGeolocation.Persistence.PER_VISIT ?
              "can access your location only when you choose to share it." :
              "would like to access your location."
          }
          </p>
          <p>When you share your location with this site, a usage indicator will appear in the address bar.</p>`;

      // Can we please ship `setHTML(...)`?
      dialog.setHTMLUnsafe(`
        ${titleString}
        <img src="./map-${this.#precision}.svg" alt="You're in Sydney!">
        <button>Allow only via my explicit action</button>
        ${
            this.#persistence === ScratchpadGeolocation.Persistence.PER_SITE ?
                "<button>Allow whenever I'm visiting this site</button>" : ""
        }
        <button>Nope</button>
      `);

      const buttons = dialog.querySelectorAll('button');
      for (const button of buttons) {
        if (button === buttons[buttons.length-1]) {
          button.addEventListener('click', _ => { this.disposeOfDialog(dialog, true); });
        } else {
          button.addEventListener('click', _ => { this.acceptDialog(dialog); });
        }
      }

      this.shadowRoot.appendChild(dialog);
      dialog.showModal();
    }
  }
}

customElements.define('scratchpad-geolocation', ScratchpadGeolocation);
