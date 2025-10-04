import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('.form');
const input = form.querySelector('input[name="search-text"]');
const loadMoreBtn = document.querySelector('.load-more');

// НОВІ ГЛОБАЛЬНІ ЗМІННІ
let currentPage = 1;
let currentQuery = '';
let totalHits = 0;

// ОБРОБНИК ФОРМИ
form.addEventListener('submit', async event => {
  event.preventDefault();

  currentQuery = input.value.trim();
  currentPage = 1; // Скинути на першу сторінку

  if (currentQuery === '') {
    iziToast.warning({
      title: 'Warning',
      message: 'Please enter a search term.',
      position: 'topRight',
    });
    return;
  }

  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);

    if (data.hits.length === 0) {
      iziToast.error({
        title: 'Error',
        message:
          'Sorry, there are no images matching your search query. Please, try again!',
        position: 'topRight',
      });
    } else {
      createGallery(data.hits);
      totalHits = data.totalHits;

      // Перевірити чи є ще зображення для завантаження
      if (currentPage * 15 < totalHits) {
        showLoadMoreButton();
      } else {
        iziToast.info({
          message: "We're sorry, but you've reached the end of search results.",
          position: 'topRight',
        });
      }
    }
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong. Please try again later.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
});

// ОБРОБНИК КНОПКИ LOAD MORE
loadMoreBtn.addEventListener('click', async () => {
  currentPage++;
  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    createGallery(data.hits);

    // Перевірити чи досягли кінця
    if (currentPage * 15 >= totalHits) {
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    }

    // Прокрутка сторінки
    scrollPage();
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Failed to load more images.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
});

// ФУНКЦІЯ ПРОКРУТКИ
function scrollPage() {
  const galleryItem = document.querySelector('.gallery-item');
  if (galleryItem) {
    const rect = galleryItem.getBoundingClientRect();
    window.scrollBy({
      top: rect.height * 2,
      behavior: 'smooth',
    });
  }
}
