class Component extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
  }
}

class EditableH1 extends Component {
  constructor() {
    super();

    this.shadowRoot.innerHTML = `
      <style>
        header {
          display: flex;
          flex-directon: row;
          align-items: center;
          gap: 1rem;
        }

        h1 {
          font-family: 'Work Sans';
          font-size: 2rem;
          font-weight: bold;
        }

        a {
          font-family: 'Work Sans';
          font-size: 0.75rem;
          text-decoration: underline;
        }

        a:active, a:hover, a:link, a:visited {
          color: black;
        }
      </style>

      <header>
        <h1>${ this.innerHTML }</h1>
        <a href='#' class='edit'>Edit</a>
      </header>
    `;
  }
}

customElements.define('editable-h1', EditableH1);
