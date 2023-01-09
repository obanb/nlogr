import { IncomingMessage, ServerResponse } from 'http';
import * as url from 'url';
import { RouterTable } from './types.js';

// const _HTTP_CONTENT_TYPE = 'application/json';
// const _HTTP_ENCODING = 'application/json';
//
// const httpGateKeeper = (req: IncomingMessage) => {
//   const contentType = req.headers['content-type'];
//   if (!contentType.includes(_HTTP_CONTENT_TYPE)) {
//     throw new Error('Unsupported content type header.');
//   }
//
//   const accept = req.headers['accept'];
//   if (!accept.includes(_HTTP_ENCODING)) {
//     throw new Error('Unsupported accept header.');
//   }
// };

export const getUrlPath = (uri: string) => url.parse(uri).pathname;

const getQueryParams = (uri: string) => {
  const path = url.parse(uri).path;
  const results = path.match(/\?(?<query>.*)/);
  const {
    groups: { query },
  } = results;
  const params = query.match(/(?<param>\w+)=(?<value>\w+)/g);
  return params;
};

const getQueryParamsPairs = (params: string[]) => {
  const pairs = params.reduce((acc, next) => {
    const [param, value] = next.split('=');
    acc[param] = value;
    return acc;
  }, {});

  return pairs;
};

const createRouter = (routerTable: RouterTable) => {
  const routes = Object.keys(routerTable);

  return {
    route: (req: IncomingMessage, res: ServerResponse) => {
      console.log('BHUUU KURVa 2');

      const method = req.method.toLowerCase();

      let found = false;
      for (const route of routes) {
        const path = getUrlPath(req.url);
        const key = `${method}${path}`;
        console.log('BHUUU KURVa 2');

        if (key === route) {
          found = true;

          if (method === 'get') {
            routerTable[key](req, res, {});
            break;
          } else if (method === 'post') {
            let body = '';

            console.log('BHUUU KURVa');
            req.on('data', (chunk) => {
              body += chunk.toString();
            });
            req.on('end', () => {
              const json = JSON.parse(body);
              console.log('BODY KURVa', JSON.stringify(json));
              routerTable[key](req, res, json);
            });
            break;
          } else {
            res.writeHead(404);
            res.end('not supported http method');
            break;
          }
        }
      }

      if (!found) {
        res.writeHead(404);
        res.end('url not found');
      }
    },
  };
};

const requestListener =
  (router: { route: (req: IncomingMessage, res: ServerResponse) => void }) =>
  (req: IncomingMessage, res: ServerResponse) => {
    try {
      router.route(req, res);
    } catch (e) {
      res.writeHead(400);
      res.end(e.message);
    }
  };

export const routing = {
  getUrlPath,
  getQueryParamsPairs,
  getQueryParams,
  createRouter,
  requestListener,
};
