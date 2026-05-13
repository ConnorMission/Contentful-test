import { Link } from 'react-router-dom';

const getFeaturedImage = (fields) => {
  const imageField = fields.featuredImage || fields.image || fields.thumbnail || fields.heroImage;
  if (imageField && imageField.fields && imageField.fields.file) {
    return imageField.fields.file.url;
  }
  for (const key in fields) {
    if (fields[key]?.fields?.file?.url) {
      return fields[key].fields.file.url;
    }
  }
  return null;
};

function BlogCard({ entry }) {
  const imageUrl = getFeaturedImage(entry.fields);

  return (
    <Link to={`/post/${entry.sys.id}`} className="card-link">
      <div className="card card-small">
        {imageUrl && (
          <img
            src={`https:${imageUrl}`}
            alt={entry.fields.title || 'Featured'}
            className="featured-image"
            style={{ height: '240px' }}
          />
        )}
        <span className="tag">{entry.sys.contentType.sys.id}</span>
        <h3>{entry.fields.title || entry.fields.name || 'Untitled Entry'}</h3>
        <p style={{ marginTop: '1rem', opacity: 0.7, fontSize: '0.9rem' }}>
          {entry.fields.excerpt || 'Read more...'}
        </p>
      </div>
    </Link>
  );
}

export default BlogCard;
