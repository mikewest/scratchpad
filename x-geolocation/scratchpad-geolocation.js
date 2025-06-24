class ScratchpadGeolocation extends HTMLElement {
  static LOCATION_REFRESHED = "location-refreshed";
 
  static Precision = {
    PRECISE: "precise",
    COARSE: "coarse"
  };

  static Persistence = {
    PERSISTENT: "persistent",
    ONCE: "once"
  };

  #userHasSeenAndAcceptedTheDialog = false;
  #precision = ScratchpadGeolocation.Precision.COARSE;
  #persistence = ScratchpadGeolocation.Persistence.ONCE;

  #demoData = {
    precise: { latitude: -33.856159, longitude: 151.215256 }, // Sydney Opera House
    coarse: { latitude: -33.87, longitude: 151.21 }, // Sydneyish
  };

  constructor() {
    super();
  }

  connectedCallback() {
    this.#precision = this.hasAttribute('precise') ?
      ScratchpadGeolocation.Precision.PRECISE :
      ScratchpadGeolocation.Precision.COARSE;

    this.#persistence = this.hasAttribute('persistent') ?
      ScratchpadGeolocation.Persistence.PERSISTENT :
      ScratchpadGeolocation.Persistence.ONCE;

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
        width: 250px;
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
          display: block;
        }
    `;

    const button = document.createElement('button');

    const img = document.createElement('img');
    img.src = "https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/my_location/default/24px.svg";
    button.appendChild(img);

    let buttonString = this.#precision === ScratchpadGeolocation.Precision.PRECISE ?
      "Share your precise location" :
      "Share your location";

    if (this.#persistence == ScratchpadGeolocation.Persistence.PERSISTENT) {
      buttonString += " persistently";
    }

    const txt = document.createTextNode(buttonString);
    button.appendChild(txt);

    root.appendChild(style);
    root.appendChild(button);
  }

  handleClick() {
    if (this.#userHasSeenAndAcceptedTheDialog) {
      this.dispatchEvent(
        new CustomEvent(ScratchpadGeolocation.LOCATION_REFRESHED, {
          detail: this.#demoData[this.#precision]
        }));
    } else {
      const dialog = document.createElement('dialog');

      const titleString = this.#persistence !== ScratchpadGeolocation.Persistence.PERSISTENT ?
        `<p>This website can only access your location when you choose to share it.</p>
         <p>When you share your location with this site, a usage indicator will appear in the address bar.</p>` :
        `<p>This website wants to know your location while you're visiting the site.</p>
         <p>When the site accesses your location, a usage indicator will appear in the address bar.</p>`;

      // Can we please ship `setHTML(...)`?
      dialog.setHTMLUnsafe(`
        ${titleString}
        <img src="./map-${this.#precision}.svg" alt="You're in Sydney!">
        <button>Got it</button>
        <button>Nope</button>
      `);
      const buttons = dialog.querySelectorAll('button');
      buttons[0].addEventListener('click', e => {
        this.#userHasSeenAndAcceptedTheDialog = true;
        dialog.close();
        this.dispatchEvent(
          new CustomEvent(ScratchpadGeolocation.LOCATION_REFRESHED, {
            detail: this.#demoData[this.#precision]
          }));
        if (this.#persistence === ScratchpadGeolocation.Persistence.PERSISTENT) {
          setInterval(_ => {
            this.dispatchEvent(
              new CustomEvent(ScratchpadGeolocation.LOCATION_REFRESHED, {
                detail: this.#demoData[this.#precision]
              }));
          }, 1000);
        }
      });
      buttons[1].addEventListener('click', _ => {
        dialog.close();
        this.dispatchEvent(
          new CustomEvent(ScratchpadGeolocation.LOCATION_REFRESHED, {
            detail: { dismissed: true }
          }));
      });

      this.shadowRoot.appendChild(dialog);
      dialog.showModal();
    }
  }
}

customElements.define('scratchpad-geolocation', ScratchpadGeolocation);
