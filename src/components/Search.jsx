import { algoliasearch } from 'algoliasearch';
import { InstantSearch, SearchBox, Hits, Configure, useSearchBox } from 'react-instantsearch';
import { Link } from 'react-router-dom';

const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_SEARCH_KEY
);

function Hit({ hit }) {
  return (
    <Link to={hit.path} className="search-hit-link">
      <div className="search-hit">
        {hit.image && <img src={hit.image} alt={hit.title} />}
        <div className="search-hit-content">
          <h4>{hit.title}</h4>
        </div>
      </div>
    </Link>
  );
}

// Custom component to handle the results dropdown visibility
function SearchResults() {
  const { query } = useSearchBox();

  if (!query) return null;

  return (
    <div className="search-results-dropdown">
      <Hits hitComponent={Hit} />
    </div>
  );
}

function Search() {
  return (
    <div className="search-container">
      <InstantSearch searchClient={searchClient} indexName={import.meta.env.VITE_ALGOLIA_INDEX_NAME}>
        <Configure hitsPerPage={5} />
        <SearchBox 
          placeholder="Search articles..." 
          submitIconComponent={() => null}
          resetIconComponent={() => null}
        />
        <SearchResults />
      </InstantSearch>
    </div>
  );
}

export default Search;
