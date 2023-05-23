import axios from 'axios';
import { Notify } from 'notiflix';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '36630358-242656ee3a90f5cf2b5c56a75';
const form = document.querySelector('.search-form');
const input = document.querySelector('input[name="searchQuery"]');
const gallery = document.querySelector('.gallery');

form.addEventListener('submit', handlerSubmit);

// додати перевірку на правильні значення
// використати бібліотеку notiflix
function handlerSubmit(evt) {
  evt.preventDefault();
  const { searchQuery } = evt.currentTarget.elements;
  searchImages(searchQuery.value)
    .then(data => (gallery.innerHTML = data.hits.map(createMarkup).join('')))
    .catch(err => console.log(err));
}


// використати бібліотеку axios

// додати пагінацію (розібратися з пагінацією по сторінкам)
function searchImages(query) {
  return fetch(
    `${BASE_URL}?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true`
  ).then(resp => {
    if (!resp.ok) {
      throw new Error(resp.statusText);
    }

    return resp.json();
  });
}


// замінити розмітку на розмітку з ТЗ
function createMarkup(data) {
  const {
    webformatURL = 'empty',
    largeImageURL,
    tags,
    likes,
    views,
    comments,
    downloads,
  } = data;
  return `<li class="item">
    <a href="${largeImageURL}">
      <img class="item-thumb" src="${webformatURL}" alt="${tags}">
      <p>Likes<span>${likes}</span></p>
      <p>Views<span>${views}</span></p>
      <p>Comments<span>${comments}</span></p>
      <p>Downloads<span>${downloads}</span></p>
    </a>
  </li>`;
}
