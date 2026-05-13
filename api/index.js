import express from 'express';
import cors from 'cors';
import { auth } from 'express-oauth2-jwt-bearer';
import { ManagementClient } from 'auth0';
import { algoliasearch } from 'algoliasearch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Auth0 Configuration
const checkJwt = auth({
  audience: `https://${process.env.VITE_AUTH0_DOMAIN}/api/v2/`,
  issuerBaseURL: `https://${process.env.VITE_AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256'
});

const management = new ManagementClient({
  domain: process.env.VITE_AUTH0_DOMAIN,
  clientId: process.env.AUTH0_MGT_CLIENT_ID,
  clientSecret: process.env.AUTH0_MGT_CLIENT_SECRET,
  audience: `https://${process.env.VITE_AUTH0_DOMAIN}/api/v2/`
});

// Algolia Configuration
const algoliaClient = algoliasearch(
  process.env.VITE_ALGOLIA_APP_ID,
  process.env.VITE_ALGOLIA_ADMIN_KEY
);

// --- Contentful Fetch Helper ---
async function contentfulGql(query, variables = {}) {
  const response = await fetch(`https://graphql.contentful.com/content/v1/spaces/${process.env.VITE_CONTENTFUL_SPACE_ID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.VITE_CONTENTFUL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const { data, errors } = await response.json();
  if (errors) throw new Error(errors[0].message);
  return data;
}

async function fetchContentfulBlogs() {
  const query = `
    query {
      blogCollection {
        items {
          sys { id }
          title
          featuredImage { url }
        }
      }
    }
  `;
  const data = await contentfulGql(query);
  return data.blogCollection.items;
}

// --- Endpoints ---

// Cached Blog Listing
app.get('/api/articles', async (req, res) => {
  try {
    const query = `
      query GetBlogList {
        blogCollection(order: sys_firstPublishedAt_DESC) {
          items {
            sys { id }
            title
            featuredImage { url, title }
          }
        }
      }
    `;
    const data = await contentfulGql(query);
    
    // Set Edge Caching headers (Vercel specific)
    // s-maxage=3600 (1 hour on CDN), stale-while-revalidate=600 (10 mins background refresh)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
    res.json(data);
  } catch (error) {
    console.error('Fetch Articles Error:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Cached Single Article
app.get('/api/articles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      query GetBlogPost($id: String!) {
        blog(id: $id) {
          sys { id }
          title
          featuredImage { url, title }
          content {
            json
            links {
              assets {
                block {
                  sys { id }
                  url
                  title
                }
              }
            }
          }
        }
      }
    `;
    const data = await contentfulGql(query, { id });
    
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
    res.json(data);
  } catch (error) {
    console.error('Fetch Article Error:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// Index all blogs in Algolia
app.post('/api/index-blogs', async (req, res) => {
  try {
    const blogs = await fetchContentfulBlogs();
    
    // Format for Algolia
    const records = blogs.map(blog => ({
      objectID: blog.sys.id,
      title: blog.title,
      image: blog.featuredImage?.url,
      path: `/post/${blog.sys.id}`
    }));

    await algoliaClient.saveObjects({ 
      indexName: process.env.VITE_ALGOLIA_INDEX_NAME, 
      objects: records 
    });

    res.json({ success: true, count: records.length });
  } catch (error) {
    console.error('Algolia Indexing Error:', error);
    res.status(500).json({ error: 'Failed to index blogs in Algolia' });
  }
});

// Profile update
app.patch('/api/profile', checkJwt, async (req, res) => {
  const userId = req.auth.payload.sub;
  const { name, nickname, bio, phone_number } = req.body;
  const updateData = { name, nickname, user_metadata: { bio } };
  if (phone_number && phone_number.startsWith('+')) {
    updateData.phone_number = phone_number.replace(/\s/g, '');
  }
  try {
    const updatedUser = await management.users.update({ id: userId }, updateData);
    res.json(updatedUser);
  } catch (error) {
    console.error('Auth0 Management Error Details:', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Visit log
app.post('/api/log-visit', checkJwt, async (req, res) => {
  const userId = req.auth.payload.sub;
  try {
    const user = await management.users.get({ id: userId });
    const currentCount = (user.data.app_metadata && user.data.app_metadata.visit_count) || 0;
    await management.users.update({ id: userId }, { app_metadata: { visit_count: currentCount + 1 } });
    res.json({ success: true, count: currentCount + 1 });
  } catch (error) {
    console.error('Auth0 Visit Log Error:', error);
    res.status(500).json({ error: 'Failed to increment visit count' });
  }
});

// Point sync
app.post('/api/sync-points', checkJwt, async (req, res) => {
  const userId = req.auth.payload.sub;
  const { points } = req.body;
  try {
    await management.users.update({ id: userId }, { app_metadata: { external_points: points } });
    res.json({ success: true, points });
  } catch (error) {
    console.error('Auth0 Point Sync Error:', error);
    res.status(500).json({ error: 'Failed to sync points to Auth0' });
  }
});

// For Vercel Serverless Functions, we export the app
export default app;
