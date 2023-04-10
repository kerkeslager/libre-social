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
    this.state = {};
  }

  applyRender() {
    let render = this.render();

    this.textContent = '';

    if(render instanceof HTMLElement) {
      this.appendChild(render);
    } else if(render instanceof Array) {
      for(let i = 0; i < render.length; i++) {
        this.appendChild(render[i]);
      }
    } else if(typeof(render) === 'string') {
      this.innerHTML = render;
    }
  }

  connectedCallback() {
    this.applyRender();
  }

  setState(newState) {
    Object.keys(newState).forEach(k => {
      this.state[k] = newState[k];
    });

    this.applyRender();
  }
}

class APIObjectComponent extends Component {
  constructor() {
    super();
    this.state = {
      object: null,
    };

    API.get(this.getAttribute('path'), {
      200: (status, data) => this.setState({ object: data }),
    });
  }
}

class CircleView extends APIObjectComponent {
  render() {
    if(this.state.object === null) return '';


    let editableHeader = document.createElement('editable-header');
    editableHeader.setAttribute('depth', 1);
    editableHeader.setAttribute('maxLength', 256);
    editableHeader.setAttribute('value', this.state.object.name);
    editableHeader.setAttribute('onSave', value => API.post(
      this.getAttribute('path'),
      { name: value },
      {
        200: (status, data) => {
          this.setState({ object: data });
        },
      }
    ));

    return [editableHeader];
  }
}

class EditableHeader extends Component {
  constructor() {
    super();

    this.state = {
      editing: false,
    };
  }

  static get observedAttributes() {
    return ['depth', 'maxLength', 'onSave', 'value'];
  }

  render() {
    if(this.state.editing) {
      let input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('value', this.getAttribute('value'));

      let submit = document.createElement('input');
      submit.setAttribute('type', 'submit');
      submit.setAttribute('value', 'Save');

      let result = document.createElement('form');
      result.addEventListener('submit', e => {
        e.preventDefault();
        this.setState({ editing: false });
      });
      result.appendChild(input);
      result.appendChild(submit);
      return result;
    } else {
      let h = document.createElement(`h${ this.getAttribute('depth') }`);
      h.textContent = this.getAttribute('value');

      let editButton = document.createElement('a');
      editButton.setAttribute('href', '');
      editButton.setAttribute('class', 'edit');
      editButton.addEventListener('click', e => {
        e.preventDefault();
        this.setState({ editing: true });
      });
      editButton.textContent = 'Edit';

      return [h, editButton];
    }
  }
}

customElements.define('circle-view', CircleView);
customElements.define('editable-header', EditableHeader);
