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
      if(this.readyState === 4) {
        let responseContent = {};

        if(xhr.responseText.length > 0) {
          responseContent = JSON.parse(xhr.responseText);
        }

        handlers[this.status](this.status, responseContent);
      }
    };
    xhr.open(method, path, true);

    switch(method) {
      case 'delete':
      case 'patch':
      case 'post':
      case 'put':
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader("X-CSRFToken", Cookie.get('csrftoken'));
      default:
    }

    xhr.send(body);
  }

  static get(path, handlers) {
    return API.request('get', path, '', handlers);
  }

  static post(path, parameters, handlers) {
    return API.request('post', path, JSON.stringify(parameters), handlers);
  }

  static _delete(path, handlers) {
    return API.request('delete', path, '', handlers);
  }
}

class Component extends HTMLElement {
  constructor() {
    super();
    this.state = {};

    /*
     * Put applyRender in the event loop, which should result in it being
     * called after the element has been rendered completely.
     */
    setTimeout(() => this.applyRender());
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

  setState(newState) {
    Object.keys(newState).forEach(k => {
      this.state[k] = newState[k];
    });

    this.applyRender();
  }

  render() {
    return null;
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

class CircleIcon extends Component { }

class CommonmarkRenderer extends Component {
  render() {
    let markup = this.getAttribute('commonmark');

    let parser = new commonmark.Parser({ smart: true });
    let writer = new commonmark.HtmlRenderer({ safe: true });

    let parsed = parser.parse(markup);
    return writer.render(parsed);
  }
}

class CircleView extends APIObjectComponent {
  render() {
    if(this.state.object === null) return null;

    let circle = document.createElement('circle-icon');
    circle.style.borderColor = '#' + this.state.object.color;

    let heading = document.createElement('editable-h1');
    heading.setAttribute('depth', 1);
    heading.setAttribute('maxLength', 256);
    heading.setAttribute('value', this.state.object.name);
    heading.addEventListener('save', e => API.post(
      this.getAttribute('path'),
      { name: e.detail.value },
      {
        200: (status, data) => {
          this.setState({ object: data });
        },
      }
    ));

    let header = document.createElement('header');
    header.appendChild(circle);
    header.appendChild(heading);

    return [header];
  }
}

class InviteOwnerView extends APIObjectComponent {
  render() {
    if(this.state.object === null) return null;

    let message = document.createElement('editable-commonmark-area');
    message.setAttribute('maxLength', 1024);
    message.setAttribute('commonmark', this.state.object.message);
    message.addEventListener('save', e => API.post(
      this.getAttribute('path'),
      { message: e.detail.commonmark },
      {
        200: (status, data) => {
          this.setState({ object: data });
        },
      },
    ));

    let deleteForm = document.createElement('delete-form');
    deleteForm.setAttribute('deleteMessage', 'Delete Invite');
    deleteForm.setAttribute('confirmationMessage', 'Are you sure?');
    deleteForm.addEventListener('confirm', () => {
      API._delete(
        this.getAttribute('path'),
        {
          204: (status, data) => {
            window.location.href = '/';
          },
        },
      );
    });

    return [message, deleteForm];
  }
}

class ProfileView extends APIObjectComponent {
  render() {
    if(this.state.object === null) return null;

    let heading = document.createElement('editable-h1');
    heading.setAttribute('maxLength', 256);
    heading.setAttribute('value', this.state.object.name);
    heading.addEventListener('save', e => API.post(
      this.getAttribute('path'),
      { name: e.detail.value },
      {
        200: (status, data) => {
          this.setState({ object: data });
        },
      }
    ));

    let description = document.createElement('editable-commonmark-area');
    description.setAttribute('maxLength', 4096);
    description.setAttribute('commonmark', this.state.object.description);
    description.addEventListener('save', e => API.post(
      this.getAttribute('path'),
      { description: e.detail.commonmark },
      {
        200: (status, data) => {
          this.setState({ object: data });
        },
      }
    ));

    return [heading, description];
  }
}

class DeleteForm extends Component {
  constructor() {
    super();
    this.state = {
      confirming: false
    }
  }

  render() {
    if(this.state.confirming) {
      let confirmButton = document.createElement('button');
      confirmButton.textContent = 'Delete';
      confirmButton.addEventListener('click', () => {
        this.dispatchEvent(new Event('confirm'));
      });

      let cancelButton = document.createElement('button');
      cancelButton.textContent = 'Cancel';
      cancelButton.addEventListener('click', () => {
        this.setState({ confirming: false });
      });

      return [
        new Text(this.getAttribute('confirmationMessage')),
        confirmButton,
        cancelButton,
      ];
    } else {
      let deleteButton = document.createElement('button');
      deleteButton.textContent = this.getAttribute('deleteMessage');
      deleteButton.addEventListener('click', () => {
        this.setState({ confirming: true });
      });
      return deleteButton;
    }
  }
}

class EditableCommonmarkArea extends Component {
  constructor() {
    super();

    this.state = {
      editing: false,
    };
  }

  static get observedAttributes() {
    return ['maxLength', 'value'];
  }

  render() {
    if(this.state.editing) {
      let input = document.createElement('textarea');
      input.value = this.getAttribute('commonmark');
      input.addEventListener('input', () => {
        input.style.height = 0;
        input.style.height = `calc(${ input.scrollHeight }px)`;
      });

      setTimeout(() => {
        input.focus();
        input.select();
      });

      let characterCounter = document.createElement('character-counter');
      characterCounter.setAttribute('maxLength', this.getAttribute('maxLength'));
      characterCounter.track(input);

      let submit = document.createElement('input');
      submit.setAttribute('type', 'submit');
      submit.setAttribute('value', 'Save');

      let result = document.createElement('form');
      result.addEventListener('submit', e => {
        e.preventDefault();
        this.dispatchEvent(new CustomEvent(
          'save', {
            detail: {
              commonmark: input.value,
            }
          }
        ));
        this.setState({ editing: false });
      });
      result.appendChild(input);
      result.appendChild(characterCounter);
      result.appendChild(submit);
      return result;
    } else {
      let h = document.createElement('commonmark-renderer');
      h.setAttribute('commonmark', this.getAttribute('commonmark'));

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

class CharacterCounter extends Component {
  track(input) {
    this.setState({ characters: input.value.length });

    input.addEventListener('input', () => this.setState({
      characters: input.value.length
    }));
  }

  render() {
    let characters = this.state.characters;
    let maxLength = this.getAttribute('maxLength');

    if(characters > maxLength) {
      this.style.color = '#cc0000';
    } else if(characters > maxLength * 0.9) {
      this.style.color = '#ddbb00';
    } else {
      this.style.color = 'black';
    }

    return `${ characters }/${ maxLength }`;
  }
}

class EditableHeading extends Component {
  constructor() {
    super();

    this.state = {
      editing: false,
    };
  }

  static get observedAttributes() {
    return ['maxLength', 'value'];
  }

  render() {
    if(this.state.editing) {
      let input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('value', this.getAttribute('value'));
      setTimeout(() => {
        input.focus();
        input.select();
      });

      let characterCounter = document.createElement('character-counter');
      characterCounter.setAttribute('maxLength', this.getAttribute('maxLength'));
      characterCounter.track(input);

      let submit = document.createElement('input');
      submit.setAttribute('type', 'submit');
      submit.setAttribute('value', 'Save');

      let result = document.createElement('form');
      result.addEventListener('submit', e => {
        e.preventDefault();
        this.dispatchEvent(new CustomEvent(
          'save', {
            detail: {
              value: input.value,
            }
          }
        ));
        this.setState({ editing: false });
      });
      result.appendChild(input);
      result.appendChild(characterCounter);
      result.appendChild(submit);
      return result;
    } else {
      let h = document.createElement(`h${ this.depth }`);
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

class EditableH1 extends EditableHeading {
  constructor() {
    super();
    this.depth = 1;
  }
}
class EditableH2 extends EditableHeading {
  constructor() {
    super();
    this.depth = 2;
  }
}
class EditableH3 extends EditableHeading {
  constructor() {
    super();
    this.depth = 3;
  }
}
class EditableH4 extends EditableHeading {
  constructor() {
    super();
    this.depth = 4;
  }
}
class EditableH5 extends EditableHeading {
  constructor() {
    super();
    this.depth = 5;
  }
}

customElements.define('circle-icon', CircleIcon);
customElements.define('character-counter', CharacterCounter);
customElements.define('commonmark-renderer', CommonmarkRenderer);
customElements.define('delete-form', DeleteForm);
customElements.define('editable-commonmark-area', EditableCommonmarkArea);
customElements.define('editable-h1', EditableH1);
customElements.define('editable-h2', EditableH2);
customElements.define('editable-h3', EditableH3);
customElements.define('editable-h4', EditableH4);
customElements.define('editable-h5', EditableH5);

customElements.define('circle-view', CircleView);
customElements.define('invite-owner-view', InviteOwnerView);
customElements.define('profile-view', ProfileView);
