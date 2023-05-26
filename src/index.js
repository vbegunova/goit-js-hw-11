import axios from 'axios';
import { Notify } from 'notiflix';
// import SimpleLightbox from "simplelightbox";
// import "simplelightbox/dist/simple-lightbox.min.css";

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '36630358-242656ee3a90f5cf2b5c56a75';
const PER_PAGE = 20;
const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const guard = document.querySelector('.guard');
let page;
let query;


form.addEventListener('submit', handlerSubmit);

function handlerSubmit(evt) {
  evt.preventDefault();
  page = 1;
  const { searchQuery } = evt.currentTarget.elements;
  query = searchQuery.value;
  searchImages(query) 
    .then(({ data }) => {
      if (data.totalHits === 0) {
        Notify.failure('Sorry, there are no images matching your search query. Please try again');
      } else {
        Notify.success(`Hooray! We found ${data.totalHits} images.`);
        gallery.innerHTML = createMarkup(data.hits);
      }
      if (data.totalHits > PER_PAGE) {
            observer.observe(guard);
        }
    })
    .catch(err => console.log(err));
  form.reset();
}

async function searchImages(query, page = 1) {
  const response = await axios.get(`${BASE_URL}?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${PER_PAGE}`);
  return response;
}

let options = {
    root: null,
    rootMargin: "400px",
    threshold: 0,
};

let observer = new IntersectionObserver(handlerPagination, options);

function handlerPagination(entries, observer) {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            page += 1;
            searchImages(query, page)
                .then(({data}) => {
                  gallery.insertAdjacentHTML('beforeend', createMarkup(data.hits));
                  if (data.totalHits <= page * PER_PAGE) {
                      Notify.warning("We're sorry, but you've reached the end of search results.");
                      observer.unobserve(guard);
                    }
                })
        }
    })
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
      <img class="item-thumb" src="${webformatURL}" alt="${tags}" loading="lazy"></a>
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
    
  </div>`).join('');
}

