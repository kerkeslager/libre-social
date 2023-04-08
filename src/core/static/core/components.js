class Component extends HTMLElement {
  constructor() {
    super();

    this.content = [];
    for(let i; i < this.childNodes.length; i++) {
      this.content.append(this.childNodes[i]);
    }
    this.contentHTML = this.innerHTML;
  }
}

class EditableHeader extends Component {
  constructor() {
    super();

    let depth = this.getAttribute('depth');
    let maxLength = this.getAttribute('max-length');

    this.innerHTML = `
      <header>
        <h${ depth }>${ this.contentHTML }</h${ depth }>
        <a href='#' class='edit'>Edit</a>
      </header>
    `;

    this.querySelector('.edit').addEventListener('click', e => {
      e.preventDefault();
      this.innerHTML = `
        <form>
          <input type='text' value='${ this.contentHTML }' />
          <span>${ this.contentHTML.length }/${ maxLength }</span>
          <input type='submit' value='Save'>
        </form>
      `;

      this.querySelector('form').addEventListener('submit', e => {
        e.preventDefault();
        console.log(e);
      });

    });
  }
}

customElements.define('editable-header', EditableHeader);
