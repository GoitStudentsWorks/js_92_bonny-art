// Імпорт функцій
import { fetchBookById } from './api';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import * as basicLightbox from 'basiclightbox';
import '../../node_modules/basiclightbox/dist/basicLightbox.min.css';
import icons from '/images/book-popup/icons.svg';
import { getNameForUpdateHeaderUser } from './header';

import { el } from './refs';

console.log('el', el);

const STORAGE_KEY = 'booksList';

function createBookCard(evt) {
  // Початок відображення спінеру

  if (evt.target === evt.currentTarget) {
    return;
  }
  const currentBook = evt.target.closest('.js-book-on-click');

  const bookId = currentBook.dataset.id;

  fetchBookById(bookId)
    .then(book => {
      const { book_image, title, author, description, buy_links } = book;
      const amazon_link = buy_links[0].url;
      const appleBooks_link = buy_links[1].url;
      const localStorage = getFromLocalStorage();
      console.log('localStorage ', localStorage);

      let buttonText;

      if (
        localStorage.length === 0 ||
        !localStorage.find(book => book._id === bookId)
      ) {
        buttonText = 'Add to shopping list';
      } else {
        buttonText = 'Remove from the shopping list';
      }

      const markup = createMarkup(
        book_image,
        title,
        author,
        description,
        amazon_link,
        appleBooks_link,
        buttonText
      );

      const instance = basicLightbox.create(
        `
    <div class="popup-modal">${markup}</div>    
`,
        {
          onShow: instance => {
            document.body.style.overflow = 'hidden';
          },
          onClose: instance => {
            document.body.style.overflow = 'visible';
          },
        }
      );

      instance.show();

      el.buttonAddToList = document.querySelector('.popup-button');
      el.buttonAddToList.addEventListener(
        'click',
        onButtonBookPopupClick.bind(book)
      );

      document.addEventListener('keydown', handlerPress.bind(instance));

      el.closeModalButton = document.querySelector('.popup-close-button');
      el.closeModalButton.addEventListener(
        'click',
        handlerClose.bind(instance)
      );

      // Функція схову кнопку для неавторизованих користувачів
      getNameForUpdateHeaderUser().then(login => {
        if (login) {
          el.buttonAddToList.classList.remove('visually-hidden');
        } else {
          el.buttonAddToList.classList.add('visually-hidden');
        }
      });

      el.textUnderRemoveButton = document.querySelector('.popup-under-button');
      if (el.buttonAddToList.textContent === 'Add to shopping list') {
        el.textUnderRemoveButton.classList.add('is-hidden');
      } else {
        el.textUnderRemoveButton.classList.remove('is-hidden');
      }
    })
    .catch(error => {
      alert(`Error: ${error}`);
    })
    .finally(() => {
      // Відключення спінеру
    });
}

function setToLocalStorage(str) {
  const localArr = getFromLocalStorage();
  localArr.push(str);
  addToLocalStorage(localArr);
}

function getFromLocalStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log(error.message);
  }
}

function addToLocalStorage(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function createMarkup(
  bookCover,
  title,
  author,
  descr,
  amazonLink,
  appleBooksLink,
  buttonText
) {
  return `
    <div class="popup-info">
      <div class="popup-cover">
        <img class="popup-img" src="${bookCover}" alt="${title}" />
      </div>
      <div class="popup-about">
        <h2 class="popup-title">${title}</h2>
        <p class="popup-author">${author}</p>
        <p class="popup-descr">${descr}</p>
        <ul class="popup-store-list">
          <li class="popup-store popup-store-amazon">
            <a href="${amazonLink}"
            target="_blank"
              rel="noopener noreferrer">
            <img src="../images/book-popup/amazon.svg" alt="" />
            </a>
          </li>
          <li class="popup-store popup-store-apple">
            <a href="${appleBooksLink}"
            target="_blank"
              rel="noopener noreferrer">
            <img src="../images/book-popup/appleBooks.svg" alt="" />
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div class="popup-shopping-list">
      <button class="popup-button">${buttonText}</button>
      <p class="popup-under-button">
         Сongratulations! You have added the book to the shopping list. To delete,
        press the button “Remove from the shopping list”.
     </p>
    </div>
    <button class="popup-close-button" type="button" data-modal-close>
      <svg class="popup-icon" width="8" height="8">
        <use href="${icons}#close-btn"></use>
      </svg>
    </button>
    `;
}

function onButtonBookPopupClick() {
  const book = this;
  if (el.buttonAddToList.textContent === 'Add to shopping list') {
    setToLocalStorage(book);
    el.buttonAddToList.textContent = 'Remove from the shopping list';
    el.textUnderRemoveButton.classList.remove('is-hidden');
  } else {
    removeFromLocalStorage(book);
    el.buttonAddToList.textContent = 'Add to shopping list';
    el.textUnderRemoveButton.classList.add('is-hidden');
  }
}

function removeFromLocalStorage({ _id: bookId }) {
  const books = getFromLocalStorage();
  const newBooks = books.filter(book => String(book._id) !== bookId);
  addToLocalStorage(newBooks);
}

//Закриття модального вікна
function handlerPress(event) {
  if (event.key !== 'Escape') {
    return;
  }
  this.close();
  document.removeEventListener('keydown', handlerPress);
}

function handlerClose() {
  this.close();
  el.closeModalButton.removeEventListener('click', handlerPress);
}

export { createBookCard };
