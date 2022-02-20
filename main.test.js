// src/__tests__/example.js
// query utilities:
import {
  getByLabelText,
  getByText,
  getByTestId,
  queryByTestId,
  getByPlaceholderText,
  getByRole,
  // Tip: all queries are also exposed on an object
  // called "queries" which you could import here as well
  waitFor,
  prettyDOM,
  logRoles,
  fireEvent,
} from '@testing-library/dom';
// adds special assertions like toHaveTextContent
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { initGroceryList } from './grocery-list';

function getDOMTemplate() {
  // This is just a raw example of setting up some DOM
  // that we can interact with. Swap this with your UI
  // framework of choice 😉
  const div = document.createElement('div');
  div.innerHTML = `
    <form>
      <input placeholder="dodaj do listy" type="text" class="add-input" />
      <button class="add-button" type="submit">
        <i class="fas fa-plus"></i>
      </button>
      <div class="select">
        <select name="filters" class="filter-options">
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="uncompleted">Uncompleted</option>
        </select>
      </div>
    </form>

    <section>
      <ul class="grocery-list"></ul>
    </section>
  `;
  initGroceryList(div);

  return div;
}

test('should add new item to list', async () => {
  const item = 'chleb';
  const container = getDOMTemplate();
  // Get form elements by their label text.
  // An error will be thrown if one cannot be found (accessibility FTW!)
  const input = getByPlaceholderText(container, 'dodaj do listy');
  fireEvent.change(input, { target: { value: item } });
  // Get elements by their text, just like a real user does.

  getByRole(container, 'button').click();

  // getByTestId and queryByTestId are an escape hatch to get elements
  // by a test id (could also attempt to get this element by its text)
  expect(getByText(container, item)).toHaveTextContent(item);
  // // jest snapshots work great with regular DOM nodes!
  expect(container).toMatchSnapshot();
});

test('should hide uncompleted item after filter select', async () => {
  const item = 'chleb';
  const container = getDOMTemplate();
  // Get form elements by their label text.
  // An error will be thrown if one cannot be found (accessibility FTW!)
  const input = getByPlaceholderText(container, 'dodaj do listy');
  fireEvent.change(input, { target: { value: item } });
  console.log(input.value);
  // Get elements by their text, just like a real user does.

  getByRole(container, 'button').click();
  userEvent.selectOptions(getByRole(container, 'combobox'), 'completed');
  console.log(prettyDOM(container));

  // getByTestId and queryByTestId are an escape hatch to get elements
  // by a test id (could also attempt to get this element by its text)
  expect(getByText(container, item)).toHaveTextContent(item);
  // // jest snapshots work great with regular DOM nodes!
  expect(container).toMatchSnapshot();
});
