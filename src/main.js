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
const galleryContainer = document.querySelector('.gallery');

const IMAGES_PER_PAGE = 15;
let currentPage = 1;
let currentQuery = '';
let totalHits = 0;
let loadedImagesCount = 0;
hideLoadMoreButton();

form.addEventListener('submit', async event => {
  event.preventDefault();

  currentQuery = input.value.trim();
  currentPage = 1;
  totalHits = 0;
  loadedImagesCount = 0;

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

    totalHits = data.totalHits;
    const currentImagesCount = data.hits.length;
    loadedImagesCount = currentImagesCount;

    if (currentImagesCount === 0) {
      iziToast.error({
        title: 'Error',
        message:
          'Sorry, there are no images matching your search query. Please, try again!',
        position: 'topRight',
      });
    } else {
      createGallery(data.hits);

      if (loadedImagesCount < totalHits) {
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

loadMoreBtn.addEventListener('click', async () => {
  hideLoadMoreButton();
  showLoader();
  currentPage++;

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    const newImagesCount = data.hits.length;
    if (newImagesCount > 0) {
      createGallery(data.hits);
      loadedImagesCount += newImagesCount;
      scrollPage();
    }
    if (newImagesCount < IMAGES_PER_PAGE || loadedImagesCount >= totalHits) {
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    } else {
      showLoadMoreButton();
    }
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Failed to load more images.',
      position: 'topRight',
    });

    if (loadedImagesCount < totalHits) {
      showLoadMoreButton();
    }
  } finally {
    hideLoader();
  }
});

function scrollPage() {
  const galleryItem = galleryContainer.firstElementChild;

  if (galleryItem) {
    const rect = galleryItem.getBoundingClientRect();
    window.scrollBy({
      top: rect.height * 2,
      behavior: 'smooth',
    });
  }
}
