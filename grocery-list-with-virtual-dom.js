import { h, diff, patch, create } from 'virtual-dom';
import classNames from 'classnames';
import countBy from 'lodash/countBy';
import mem from 'mem';
import getColor from 'number-to-color/hexMap';

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

export function init(view) {
  const mountNode = view || document;

  const addInput = mountNode.querySelector('.add-input');
  const addButton = mountNode.querySelector('.add-button');
  const groceryListRoot = mountNode.getElementById('grocery-list-root');
  const filterOption = mountNode.querySelector('.filter-options');

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

  let currentView = groceryListView(store.dispatch, store.getState());
  let rootNode = create(currentView);

  groceryListRoot.innerHTML = '';
  groceryListRoot.appendChild(rootNode);

  store.subscribe(() => {
    const updatedView = groceryListView(store.dispatch, store.getState());
    const patches = diff(currentView, updatedView);
    rootNode = patch(rootNode, patches);
    currentView = updatedView;
  });

  store.dispatch({
    type: 'ADD_ITEM',
    payload: {
      text: 'mleko',
    },
  });
  store.dispatch({
    type: 'ADD_ITEM',
    payload: {
      text: 'chleb',
    },
  });
  store.dispatch({
    type: 'ADD_ITEM',
    payload: {
      text: 'ser',
    },
  });
  store.dispatch({
    type: 'ADD_ITEM',
    payload: {
      text: 'szynka',
    },
  });
  // //Event Listeners
  addButton.addEventListener('click', addItem);
  filterOption.addEventListener('change', filterChecklist);

  // //Functions
  function filterChecklist(e) {
    store.dispatch({
      type: 'FILTER_CHANGED',
      payload: {
        filter: e.target.value,
      },
    });
  }
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
}
const memCountCompleted = mem(countCompleted);

function groceryListView(dispatch, model) {
  const { groceryList, activeFilter } = model;
  const count = memCountCompleted(groceryList);

  const list = filter(groceryList, activeFilter).map(function (item) {
    return h(
      'li',
      {
        className: classNames('grocery-list-item', {
          completed: item.completed,
        }),
      },
      [
        h(
          'span',
          {
            className: 'grocery-list-item-text',
            style: {
              color: item.completed
                ? getColor(count / groceryList.length)
                : 'inherit',
            },
          },
          item.text
        ),
        h(
          'button',
          {
            className: 'complete-btn',
            onclick: () => completeItem(item.id),
          },
          h('i', {
            className: 'fas fa-check',
          })
        ),
        h(
          'button',
          {
            className: 'delete-btn',
            onclick: () => deleteItem(item.id),
          },
          h('i', {
            className: 'fas fa-trash',
          })
        ),
      ]
    );
  });

  return h(
    'ul',
    {
      className: 'grocery-list',
    },
    list
  );

  function filter(list, filter) {
    if (filter === 'all') {
      return list;
    }
    return list.filter((i) => {
      return filter === 'completed' ? i.completed : !i.completed;
    });
  }

  function deleteItem(id) {
    dispatch({
      type: 'DELETE_ITEM',
      payload: {
        id: id,
      },
    });
  }

  function completeItem(id) {
    dispatch({
      type: 'COMPLETE_ITEM',
      payload: {
        id: id,
      },
    });
  }
}
function countCompleted(list) {
  console.count('countItems');
  const count = countBy(list, 'completed');
  return count[true];
}
