const SPACE_ID = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;

/**
 * Helper to fetch data from Contentful GraphQL API
 * @param {string} query - The GraphQL query string
 * @param {object} variables - Variables for the query
 */
export async function contentfulGql(query, variables = {}) {
  const url = `https://graphql.contentful.com/content/v1/spaces/${SPACE_ID}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    const { data, errors } = await response.json();

    if (errors) {
      console.error('GraphQL Errors:', errors);
      throw new Error(errors[0].message);
    }

    return data;
  } catch (error) {
    console.error('Contentful GQL Fetch Error:', error);
    throw error;
  }
}
