function getGroceryListStore() {
  const store = {};
  store.state = { groceryList: [] };

  store.getState = () => store.state;

  store.addItem = (text, callback) => {
    const id = Date.now();
    const completed = false;
    const newItem = { id, text, completed };
    const nextState = {
      groceryList: [...store.state.groceryList, newItem],
    };
    store.state = nextState;

    if (callback) {
      callback(newItem);
    }
    console.log({ store });
  };

  store.deleteItem = (id, callback) => {
    const groceryList = store.state.groceryList.filter((i) => {
      return i.id !== id;
    });

    const nextState = {
      groceryList,
    };

    store.state = nextState;

    console.log({ store });

    if (callback) {
      callback();
    }
  };

  store.completeItem = (id, callback) => {
    const groceryList = store.state.groceryList.map((i) => {
      if (i.id === id) {
        return { ...i, completed: !i.completed };
      }
      return i;
    });

    const nextState = {
      groceryList,
    };

    store.state = nextState;

    console.log({ store });

    if (callback) {
      callback();
    }
  };

  return store;
}

export function init(view) {
  const mountNode = view || document;

  const store = getGroceryListStore();
  store.addItem('ser');
  store.addItem('chleb');

  const addInput = mountNode.querySelector('.add-input');
  const addButton = mountNode.querySelector('.add-button');
  const groceryList = mountNode.querySelector('.grocery-list');
  const filterOption = mountNode.querySelector('.filter-options');

  //Event Listeners
  document.addEventListener('DOMContentLoaded', initHandler);
  addButton.addEventListener('click', addItemHandler);
  filterOption.addEventListener('change', filterChecklist);

  //Functions

  function addItemHandler(e) {
    e.preventDefault();

    store.addItem(addInput.value, (item) => {
      const newItem = getItemNodeFrom(item);
      groceryList.appendChild(newItem);

      addInput.value = '';
    });
  }

  function getItemNodeFrom(item) {
    const newItem = document.createElement('li');
    newItem.classList.add('grocery-list-item');

    const text = document.createElement('span');
    text.textContent = item.text;

    text.classList.add('grocery-list-item-text');
    newItem.appendChild(text);

    const completedButton = document.createElement('button');
    completedButton.innerHTML = `<i class="fas fa-check"></i>`;
    completedButton.classList.add('complete-btn');
    completedButton.addEventListener('click', (e) =>
      store.completeItem(item.id, () =>
        e.target.parentElement.classList.toggle('completed')
      )
    );
    newItem.appendChild(completedButton);

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = `<i class="fas fa-trash"></i>`;
    deleteButton.classList.add('delete-btn');
    deleteButton.addEventListener('click', (e) =>
      store.deleteItem(item.id, () => e.target.parentElement.remove())
    );
    newItem.appendChild(deleteButton);
    return newItem;
  }

  function filterChecklist(e) {
    const checklist = groceryList.childNodes;
    checklist.forEach(function (item) {
      switch (e.target.value) {
        case 'all':
          item.style.display = 'flex';
          break;
        case 'completed':
          if (item.classList.contains('completed')) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
          break;
        case 'uncompleted':
          if (!item.classList.contains('completed')) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
      }
    });
  }

  function initHandler() {
    let data = store.getState();

    data.groceryList.forEach(function (item) {
      const newItem = getItemNodeFrom(item);

      groceryList.appendChild(newItem);
    });
  }
}
