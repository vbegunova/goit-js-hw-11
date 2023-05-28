import axios from 'axios';
import { Notify } from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '36694393-8bc689be0a863a766f731264d';
const PER_PAGE = 40;
const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const guard = document.querySelector('.guard');
let page = 1;
let query;

const lightbox = new SimpleLightbox('.gallery a');

let options = {
    root: null,
    rootMargin: "400px",
    threshold: 0,
};

let observer = new IntersectionObserver(handlerPagination, options);

form.addEventListener('submit', handlerSubmit);

function handlerSubmit(evt) {
  evt.preventDefault();
  page = 1;
  const { searchQuery } = evt.currentTarget.elements;
  query = searchQuery.value.trim();
  if (!query) {
    Notify.warning('Please input valid query');
    gallery.innerHTML = '';
    form.reset();
    return;
  } else {
    searchImages(query, page);
    form.reset();
  }
}

async function searchImages(query, page) {
  try {
    console.log(page);
    const response = await axios.get(`${BASE_URL}?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${PER_PAGE}`);
    if (response.data.totalHits === 0) {
      Notify.failure('Sorry, there are no images matching your search query. Please try again');
    } else if (page === 1) {
      Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
      gallery.innerHTML = createMarkup(response.data.hits);
    } else {
      gallery.insertAdjacentHTML('beforeend', createMarkup(response.data.hits));
    }
    lightbox.refresh();
      
    const { height: cardHeight } = document
      .querySelector(".gallery")
      .firstElementChild.getBoundingClientRect();
    
    window.scrollBy({
      top: cardHeight * 2,
      behavior: "smooth",
    });
    
    if (response.data.totalHits > PER_PAGE) {
      observer.observe(guard);
    }
    
    if (response.data.totalHits <= page * PER_PAGE) {
      Notify.warning("We're sorry, but you've reached the end of search results.");
      observer.unobserve(guard);
    }
  } catch(err) {
    console.log(err.message);
  }
}

function handlerPagination(entries, observer) {
  if (!query) {
    return;
  }
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      page += 1;
      searchImages(query, page);
    }
  });
}

function createMarkup(arr) {
  return arr.map(({webformatURL,
    largeImageURL,
    tags,
    likes,
    views,
    comments,
    downloads}) => `<div class="photo-card">
    <a href="${largeImageURL}">
      <img class="item-thumb" src="${webformatURL}" alt="${tags}" loading="lazy">
      <div class="info">
        <p class="info-item">
          <b>Likes</b>
          ${likes}
        </p>
        <p class="info-item">
          <b>Views</b>
          ${views}
        </p>
        <p class="info-item">
          <b>Comments</b>
          ${comments}
        </p>
        <p class="info-item">
          <b>Downloads</b>
          ${downloads}
        </p>
      </div>
    </a>
  </div>`).join('');
}
