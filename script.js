const STORAGE_KEY = "reading-list-books-v1";
const form = document.querySelector("#book-form");
const titleInput = document.querySelector("#title");
const authorInput = document.querySelector("#author");
const bookList = document.querySelector("#book-list");
const emptyState = document.querySelector("#empty-state");
const bookCount = document.querySelector("#book-count");
const formMessage = document.querySelector("#form-message");
const filterButtons = [...document.querySelectorAll(".filter")];

let books = loadBooks();
let activeFilter = "all";

function loadBooks() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored.filter(book =>
      book && typeof book.id === "string" &&
      typeof book.title === "string" &&
      typeof book.author === "string" &&
      typeof book.read === "boolean"
    ) : [];
  } catch {
    return [];
  }
}

function saveBooks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function makeAction(label, className, handler) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  if (className) button.className = className;
  button.addEventListener("click", handler);
  return button;
}

function renderBooks() {
  bookList.replaceChildren();
  const visibleBooks = books.filter(book =>
    activeFilter === "all" ||
    (activeFilter === "read" && book.read) ||
    (activeFilter === "unread" && !book.read)
  );

  visibleBooks.forEach(book => {
    const item = document.createElement("li");
    item.className = `book-item${book.read ? " is-read" : ""}`;

    const mark = document.createElement("div");
    mark.className = "book-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = book.read ? "✓" : "▤";

    const info = document.createElement("div");
    info.className = "book-info";
    const title = document.createElement("h3");
    title.textContent = book.title;
    const author = document.createElement("p");
    author.textContent = `by ${book.author} · ${book.read ? "Finished" : "To read"}`;
    info.append(title, author);

    const actions = document.createElement("div");
    actions.className = "book-actions";
    actions.append(
      makeAction(book.read ? "Mark unread" : "Mark finished", "", () => {
        books = books.map(entry => entry.id === book.id ? { ...entry, read: !entry.read } : entry);
        saveBooks();
        renderBooks();
      }),
      makeAction("Remove", "remove", () => {
        books = books.filter(entry => entry.id !== book.id);
        saveBooks();
        renderBooks();
      })
    );

    item.append(mark, info, actions);
    bookList.append(item);
  });

  const finished = books.filter(book => book.read).length;
  bookCount.textContent = `${books.length} ${books.length === 1 ? "book" : "books"} · ${finished} finished`;
  emptyState.classList.toggle("hidden", visibleBooks.length > 0);
  if (books.length > 0 && visibleBooks.length === 0) {
    emptyState.querySelector("h3").textContent = "No books in this filter";
    emptyState.querySelector("p").textContent = "Choose another filter or add a new book.";
  } else {
    emptyState.querySelector("h3").textContent = "Your reading journey starts here";
    emptyState.querySelector("p").textContent = "Add your first book using the form above.";
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  if (!title || !author) {
    formMessage.textContent = "Please enter both a title and an author.";
    return;
  }
  books.unshift({
    id: (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    title,
    author,
    read: false
  });
  saveBooks();
  activeFilter = "all";
  filterButtons.forEach(button => button.classList.toggle("active", button.dataset.filter === activeFilter));
  form.reset();
  formMessage.textContent = "Book added to your reading list.";
  renderBooks();
  titleInput.focus();
});

filterButtons.forEach(button => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  filterButtons.forEach(item => item.classList.toggle("active", item === button));
  renderBooks();
}));

renderBooks();
