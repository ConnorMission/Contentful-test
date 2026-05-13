import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS } from '@contentful/rich-text-types';
import { contentfulGql } from '../utils/contentfulGql';

const BLOG_POST_QUERY = `
  query GetBlogPost($id: String!) {
    blog(id: $id) {
      sys {
        id
      }
      title
      featuredImage {
        url
        title
      }
      content {
        json
        links {
          assets {
            block {
              sys {
                id
              }
              url
              title
            }
          }
        }
      }
    }
  }
`;

function BlogPost() {
  const { id } = useParams();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        setLoading(true);
        const data = await contentfulGql(BLOG_POST_QUERY, { id });
        setEntry(data.blog);
        setError(null);

        // Log visit via backend proxy if authenticated
        if (isAuthenticated) {
          try {
            const token = await getAccessTokenSilently();
            await fetch('/api/log-visit', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            console.log('Visit logged via API');
          } catch (logErr) {
            console.warn('Could not log visit (maybe proxy is down):', logErr);
            // Fallback to local storage for demo
            const currentCount = parseInt(localStorage.getItem('simulated_visit_count') || '0');
            localStorage.setItem('simulated_visit_count', (currentCount + 1).toString());
          }
        }
        
      } catch (err) {
        console.error('Error fetching entry via GraphQL:', err);
        setError('Article not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [id]);

  const renderOptions = (links) => {
    const assetMap = new Map();
    if (links?.assets?.block) {
      for (const asset of links.assets.block) {
        assetMap.set(asset.sys.id, asset);
      }
    }

    return {
      renderNode: {
        [BLOCKS.EMBEDDED_ASSET]: (node) => {
          const asset = assetMap.get(node.data.target.sys.id);
          if (!asset) return null;
          return (
            <div className="embedded-asset">
              <img src={asset.url} alt={asset.title} />
            </div>
          );
        }
      }
    };
  };

  if (loading) return <div className="container loading"><span className="loader"></span></div>;
  if (error) return <div className="container"><div className="card">{error}</div></div>;
  if (!entry) return null;

  return (
    <div className="container">
      <Link to="/" className="btn-back">← Back to Listing</Link>
      
      <article className="post-detail">
        {entry.featuredImage && (
          <div className="post-hero">
            <img src={entry.featuredImage.url} alt={entry.featuredImage.title} />
          </div>
        )}
        
        <header className="post-header">
          <span className="tag">Blog</span>
          <h1 className="post-title">{entry.title}</h1>
        </header>
        
        <div className="content-body post-content">
          {entry.content?.json && (
            <div className="rich-text">
              {documentToReactComponents(entry.content.json, renderOptions(entry.content.links))}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

export default BlogPost;
