class Cookie {
  static get(key) {
      var cookieArr = document.cookie.split(";");

      for(var i = 0; i < cookieArr.length; i++) {
          var cookiePair = cookieArr[i].split("=");

          if(key === cookiePair[0].trim()) {
              return decodeURIComponent(cookiePair[1]);
          }
      }

      return null;
  }

  static set(key, value, maxAge) {
    var cookie = key + "=" + encodeURIComponent(value);
    if(typeof maxAge === "number") {
        cookie += "; max-age=" + maxAge;
    }
    cookie += '; secure';
    document.cookie = cookie;
  }
}

class API {
  static request(method, path, body, handlers) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if(this.readyState === 4) handlers[this.status](
        this.status,
        JSON.parse(xhr.responseText),
      );
    };
    xhr.open(method, path, true);

    if(method === 'post') {
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader("X-CSRFToken", Cookie.get('csrftoken'));
    }

    xhr.send(body);
  }

  static get(path, handlers) {
    return API.request('get', path, '', handlers);
  }

  static post(path, parameters, handlers) {
    return API.request('post', path, JSON.stringify(parameters), handlers);
  }
}

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

    this.showHeader();
  }

  showHeader() {
    let depth = this.getAttribute('depth');

    this.innerHTML = `
      <header>
        <h${ depth }>${ this.contentHTML }</h${ depth }>
        <a href='#' class='edit'>Edit</a>
      </header>
    `;

    this.querySelector('.edit').addEventListener('click', e => {
      e.preventDefault();
      this.showForm();
    });
  }

  showForm() {
    let maxLength = this.getAttribute('max-length');

    this.innerHTML = `
      <form>
        <input type='text' value='${ this.contentHTML }' />
        <span>${ this.contentHTML.length }/${ maxLength }</span>
        <input type='submit' value='Save'>
      </form>
    `;

    this.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      this.showHeader();
    });
  }
}

customElements.define('editable-header', EditableHeader);
