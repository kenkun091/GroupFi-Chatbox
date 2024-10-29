import { request, gql } from 'graphql-request';
import dotenv from 'dotenv';

dotenv.config();

const graph_api_key = process.env.GRAPH_API_KEY;

const endpoint = `https://gateway.thegraph.com/api/${graph_api_key}/subgraphs/id/J4XbkvmPeCwBstAGXFwvWih4TFfmcp5xbmpXLaNeSBtp`;


const cutoffDate = new Date();
// last 5 years
cutoffDate.setFullYear(cutoffDate.getFullYear() - 5);
const cutoffTimestamp = Math.floor(cutoffDate.getTime() / 1000);

const query = `{
  events(orderBy: tokenCount, orderDirection: desc, first: 3, where: { created_gte: ${cutoffTimestamp} }) {
    id
    created
    tokenCount
    tokens {
      id
    }
  }
}
`;

async function fetchData() {
  try {
    const data = await request(endpoint, query);
    console.log(data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// test
// const data = await fetchData();

// const tokenIdsByEvent = data.events.map(event => ({
//     eventId: event.id,
//     tokenIds: event.tokens.map(token => token.id)
//   }));

// console.log(tokenIdsByEvent);
