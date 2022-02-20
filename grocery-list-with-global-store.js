export function init(view) {
  const mountNode = view || document;

  const addInput = mountNode.querySelector('.add-input');
  const addButton = mountNode.querySelector('.add-button');
  const groceryList = mountNode.querySelector('.grocery-list');
  const filterOption = mountNode.querySelector('.filter-options');

  const createStore = (reducer, initialState) => {
    const store = {};
    store.state = initialState;
    store.listeners = [];

    store.getState = () => store.state;

    store.subscribe = (listener) => {
      store.listeners.push(listener);
    };

    store.dispatch = (action) => {
      console.log('ACTION:', action);
      console.log('BEFORE:', store.state);
      store.state = reducer(store.state, action);
      console.log('AFTER:', store.state);

      store.listeners.forEach((listener) => listener());
    };

    return store;
  };

  const getInitialState = () => ({
    groceryList: [],
    activeFilter: 'all',
  });

  const reducer = (prevState = getInitialState(), action) => {
    switch (action.type) {
      case 'ADD_ITEM': {
        const id = Date.now();
        const completed = false;
        const nextState = {
          ...prevState,
          groceryList: [
            ...prevState.groceryList,
            { id, text: action.payload.text, completed },
          ],
        };

        return nextState;
      }
      case 'DELETE_ITEM': {
        const groceryList = prevState.groceryList.filter((i) => {
          return i.id !== action.payload.id;
        });
        const nextState = { ...prevState, groceryList };

        return nextState;
      }
      case 'COMPLETE_ITEM': {
        const groceryList = prevState.groceryList.map((i) => {
          if (i.id === action.payload.id) {
            return { ...i, completed: !i.completed };
          }
          return i;
        });
        const nextState = { ...prevState, groceryList };

        return nextState;
      }
      case 'FILTER_CHANGED': {
        const nextState = {
          ...prevState,
          activeFilter: action.payload.filter,
        };

        return nextState;
      }
      default:
        return prevState;
    }
  };
  const store = createStore(reducer, getInitialState());

  store.subscribe(() => {
    console.log(store.getState());
    render();
  });

  store.dispatch({
    type: 'ADD_ITEM',
    payload: {
      text: 'Mleko',
    },
  });
  console.log(store.getState());

  // //Event Listeners
  // document.addEventListener('DOMContentLoaded', getTodos);
  addButton.addEventListener('click', addItem);
  // groceryList.addEventListener('click', deleteItem);
  // filterOption.addEventListener('change', filterChecklist);

  // //Functions

  function addItem(e) {
    e.preventDefault();
    store.dispatch({
      type: 'ADD_ITEM',
      payload: {
        text: addInput.value,
      },
    });
    addInput.value = '';
  }

  function deleteItem(id) {
    store.dispatch({
      type: 'DELETE_ITEM',
      payload: {
        id: id,
      },
    });
  }

  function completeItem(id) {
    store.dispatch({
      type: 'COMPLETE_ITEM',
      payload: {
        id: id,
      },
    });
  }

  function render() {
    const { groceryList: data } = store.getState();

    const list = document.createDocumentFragment();
    data.forEach(function (item) {
      const newItem = document.createElement('li');
      newItem.classList.add('grocery-list-item');

      if (item.completed) {
        newItem.classList.add('completed');
      }
      const text = document.createElement('span');
      text.innerText = item.text;
      text.classList.add('grocery-list-item-text');
      newItem.appendChild(text);

      //Create Completed Button
      const completedButton = document.createElement('button');
      completedButton.innerHTML = `<i class="fas fa-check"></i>`;
      completedButton.classList.add('complete-btn');
      completedButton.addEventListener('click', () => completeItem(item.id));
      newItem.appendChild(completedButton);

      //Create trash button
      const deleteButton = document.createElement('button');
      deleteButton.innerHTML = `<i class="fas fa-trash"></i>`;
      deleteButton.classList.add('delete-btn');
      deleteButton.addEventListener('click', () => deleteItem(item.id));
      newItem.appendChild(deleteButton);
      //attach final Todo
      list.appendChild(newItem);
    });
    groceryList.innerHTML = '';
    groceryList.appendChild(list);
  }
}
