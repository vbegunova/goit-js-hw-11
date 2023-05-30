import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { PER_PAGE } from './partials/api-options';
import { searchImages } from './partials/searchImages';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const guard = document.querySelector('.guard');
let page = 1;
let query;

const lightbox = new SimpleLightbox('.gallery a');
Notify.init({ showOnlyTheLastOne: true });

let options = {
  root: null,
  rootMargin: '400px',
  threshold: 0,
};

let observer = new IntersectionObserver(handlerPagination, options);

form.addEventListener('submit', handlerSubmit);

async function handlerSubmit(evt) {
  evt.preventDefault();
  page = 1;
  const { searchQuery } = evt.currentTarget.elements;
  query = searchQuery.value.trim();
  if (!query) {
    Notify.warning('Please input valid query');
    gallery.innerHTML = '';
    return;
  }
  const data = await searchImages(query, page);
  if (data.totalHits === 0) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again'
    );
    gallery.innerHTML = '';
    form.reset();
    return;
  } else if (page === 1) {
    Notify.success(`Hooray! We found ${data.totalHits} images.`);
    gallery.innerHTML = createMarkup(data.hits);
  }
  lightbox.refresh();

  if (data.totalHits > PER_PAGE) {
    observer.observe(guard);
  }

  if (data.totalHits <= page * PER_PAGE && page !== 1) {
    Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
    observer.unobserve(guard);
  }
  form.reset();
}

// async function searchImages(query, page) {
//   try {
//     const response = await axios.get(
//       `${BASE_URL}?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${PER_PAGE}`
//     );
//     const totalHits = response.data.totalHits;
//     const hits = response.data.hits;
//     return { totalHits, hits };
//   } catch (err) {
//     console.log(err.message);
//   }
// }

// function handlerSubmit(evt) {
//   evt.preventDefault();
//   page = 1;
//   const { searchQuery } = evt.currentTarget.elements;
//   query = searchQuery.value.trim();
//   if (!query) {
//     Notify.warning('Please input valid query');
//     gallery.innerHTML = '';
//     form.reset();
//     return;
//   } else {
//     searchImages(query, page);
//     form.reset();
//   }
// }

// async function searchImages(query, page) {
//   try {
//     const response = await axios.get(
//       `${BASE_URL}?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${PER_PAGE}`
//     );
//     if (response.data.totalHits === 0) {
//       Notify.failure(
//         'Sorry, there are no images matching your search query. Please try again'
//       );
//       gallery.innerHTML = '';
//       return;
//     } else if (page === 1) {
//       Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
//       gallery.innerHTML = createMarkup(response.data.hits);
//     } else {
//       gallery.insertAdjacentHTML('beforeend', createMarkup(response.data.hits));
//     }
//     lightbox.refresh();

//     if (response.data.totalHits > PER_PAGE) {
//       observer.observe(guard);
//     }

//     if (response.data.totalHits <= page * PER_PAGE) {
//       Notify.warning(
//         "We're sorry, but you've reached the end of search results."
//       );
//       observer.unobserve(guard);
//     }
//   } catch (err) {
//     console.log(err.message);
//   }
// }

function handlerPagination(entries, observer) {
  console.log(entries);
  if (!query) {
    return;
  }
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      page += 1;
      const data = await searchImages(query, page);
      gallery.insertAdjacentHTML('beforeend', createMarkup(data.hits));
      lightbox.refresh();
    }
  });
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<div class="photo-card">
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
  </div>`
    )
    .join('');
}
