class ScratchpadGeolocation extends HTMLElement {
  static LOCATION_REFRESHED = "location-refreshed";
  
  #userHasSeenAndAcceptedTheDialog = false;

  constructor() {
    super();
  }

  connectedCallback() {
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
        transition: background-color 0.3s ease, transform 0.2s ease;
        font-size: 1.25em;
        text-align: center;
      }

      button:hover {
        background-color: #0CF;
        transform: translateY(-2px);
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
        width: 300px;
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

    const txt = document.createTextNode("Share current location");
    button.appendChild(txt);

    root.appendChild(style);
    root.appendChild(button);
  }

  handleClick() {
    if (this.#userHasSeenAndAcceptedTheDialog) {
      this.dispatchEvent(
        new CustomEvent(ScratchpadGeolocation.LOCATION_REFRESHED, {
          detail: { latitude: -33.856159, longitude: 151.215256 }
        }));
    } else {
      const dialog = document.createElement('dialog');

      // Can we please ship `setHTML(...)`?
      dialog.setHTMLUnsafe(`
        <p>This website can only access your location when you choose to share it.</p>
        <p>When you share your location with this app, a usage indicator will appear in the address bar.</p>
        <img src="./map.png" alt="You're in Sydney!">
        <button>Got it</button>
        <button>Nope</button>
      `);
      const buttons = dialog.querySelectorAll('button');
      buttons[0].addEventListener('click', e => {
        this.#userHasSeenAndAcceptedTheDialog = true;
        dialog.close();
        this.dispatchEvent(
          new CustomEvent(ScratchpadGeolocation.LOCATION_REFRESHED, {
            detail: { latitude: -33.856159, longitude: 151.215256 }
          }));
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
