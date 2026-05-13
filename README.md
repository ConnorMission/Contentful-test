# Contentful Premium Blog Integration

A high-performance, secure, and feature-rich React blog application integrated with **Contentful CMS**, **Auth0 Authentication**, and **Algolia Search**. Optimized for deployment on **Vercel** with Edge Caching.

## 🚀 Features

- **Contentful CMS**: Dynamic content management via Contentful's GraphQL API.
- **Auth0 Authentication**: Secure login/logout flow with personalized user profiles.
- **Serverless Proxy**: A Node.js backend (Vercel Functions) to securely handle Auth0 Management API calls and Algolia indexing.
- **Edge Caching**: Optimized with Vercel Edge Caching (`s-maxage`) to reduce API costs and improve global performance.
- **Algolia Search**: Lightning-fast full-text search for blog articles.
- **Visit Tracking**: Automatically logs user visits and increments counts in Auth0 metadata.
- **Premium Design**: Modern, responsive UI with smooth transitions and curated typography.

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, React Router 7.
- **Backend**: Express (Vercel Serverless Functions).
- **CMS**: Contentful (GraphQL).
- **Auth**: Auth0 (React SDK + Management API).
- **Search**: Algolia.
- **Styling**: Vanilla CSS (Premium Custom Design).

## 🏗 Project Structure

```text
├── api/                # Vercel Serverless Functions (Backend Proxy)
│   └── index.js        # Main API entry point (Express)
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page views (BlogList, BlogPost, Profile, etc.)
│   ├── utils/          # Frontend helpers
│   └── App.jsx         # Main application routing
├── public/             # Static assets
├── vercel.json         # Vercel deployment and routing configuration
└── package.json        # Dependencies and scripts
```

## ⚙️ Setup & Installation

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd contentful-blog
npm install
```

### 2. Environment Variables
Create a `.env` file in the root and add the following:

```env
# Contentful
VITE_CONTENTFUL_SPACE_ID=your_space_id
VITE_CONTENTFUL_ACCESS_TOKEN=your_access_token

# Auth0 (Public)
VITE_AUTH0_DOMAIN=your_domain
VITE_AUTH0_CLIENT_ID=your_client_id

# Auth0 (Private - Backend only)
AUTH0_MGT_CLIENT_ID=your_management_client_id
AUTH0_MGT_CLIENT_SECRET=your_management_client_secret

# Algolia
VITE_ALGOLIA_APP_ID=your_app_id
VITE_ALGOLIA_ADMIN_KEY=your_admin_key
VITE_ALGOLIA_INDEX_NAME=blog_posts
```

### 3. Run Locally
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

## 🚢 Deployment

### Vercel
1. Push your code to GitHub.
2. Connect your repository to Vercel.
3. Add the environment variables listed above in the Vercel Dashboard.
4. Vercel will automatically detect the `api/` directory and deploy it as serverless functions.

## 🔒 Security & Performance

- **Token Security**: Contentful and Auth0 Management tokens are stored on the server-side only. The frontend communicates with `/api/` endpoints to keep secrets safe.
- **Caching**: The `/api/articles` endpoints utilize `Cache-Control` headers. Vercel's Edge Network caches these responses, reducing hits to Contentful and speeding up the site for users worldwide.
- **Visit Logging**: User visits are tracked via a secure proxy to the Auth0 Management API, preventing clients from directly modifying their own metadata.

---

Built with ❤️ by ConnorMission.
