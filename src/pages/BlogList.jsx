import { useState, useEffect } from 'react';
import BlogCard from '../components/BlogCard';


function BlogList() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/articles');
        if (!response.ok) throw new Error('Failed to fetch from backend');
        const data = await response.json();

        const transformedItems = data.blogCollection.items.map(item => ({
          sys: {
            id: item.sys.id,
            contentType: { sys: { id: 'blog' } }
          },
          fields: {
            title: item.title,
            excerpt: 'Read full article...', // Fallback since excerpt isn't in schema
            featuredImage: item.featuredImage ? {
              fields: {
                file: { url: item.featuredImage.url.replace('https:', '') },
                title: item.featuredImage.title
              }
            } : null
          }
        }));

        setEntries(transformedItems);
        setError(null);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Failed to fetch the blog list.');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  return (
    <div className="container">
      <header style={{ border: 'none', padding: 0, marginBottom: '3rem', paddingBottom: '10px' }}>
        <h1 style={{ fontSize: '3rem' }}>Latest <span className="accent-text">Articles</span></h1>
        <p>Explore our collection (Powered by GraphQL).</p>
      </header>

      {loading && (
        <div className="loading">
          <span className="loader"></span>
          Loading articles...
        </div>
      )}

      {error && <div className="card" style={{ borderColor: 'red' }}>{error}</div>}

      <div className="flex">
        {entries.map(entry => (
          <BlogCard key={entry.sys.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

export default BlogList;
