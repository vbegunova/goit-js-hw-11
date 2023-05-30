import axios from 'axios';
import { BASE_URL, API_KEY, PER_PAGE } from './api-options';

async function searchImages(query, page) {
  try {
    const response = await axios.get(
      `${BASE_URL}?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${PER_PAGE}`
    );
    const totalHits = response.data.totalHits;
    const hits = response.data.hits;
    return { totalHits, hits };
  } catch (err) {
    console.log(err.message);
  }
}

export { searchImages };
