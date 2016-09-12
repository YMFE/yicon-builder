import Koa from 'koa';
import React from 'react';
import path from 'path';
import routes from './routes';
import ReactDOM from 'react-dom/server';
import compress from 'koa-compress';
import session from 'koa-session';
import serve from 'koa-static';
import favicon from 'koa-favicon';
import { match, RouterContext } from 'react-router';
import { Provider } from 'react-redux';
import createStore from './reducer';
import Html from './helpers/Html';
// import { getPageTitle } from './helpers/utils';
import { router, down } from './controller';
import isomFetch from 'isom-fetch';
import logger from './logger';
import watcher from './helpers/watcher';

const app = new Koa();
const { PORT } = process.env;

app.keys = [
  'WinterIsComing',
  'TheNorthRemember',
];
app.use(compress());
app.use(favicon(path.join(__dirname, '../static/favicon.ico')));
app.use(session({ key: 'yicon:sess' }, app));
app.use(serve(path.join(__dirname, '../static')));

app.use(router.routes());
app.use(down.routes());

function fetchServerData(props, { dispatch }) {
  return props.components.map(c => {
    if (!c) return null;
    const fetchHandler = c.fetchServerData;
    if (typeof fetchHandler === 'function') {
      return fetchHandler(dispatch, props);
    }
    return null;
  }).filter(v => v);
}

function dispatchUserInfo({ dispatch }, sess) {
  dispatch({
    type: 'FETCH_USER_INFO',
    payload: {
      userId: sess.userId,
      name: sess.domain,
      real: sess.name ? decodeURIComponent(sess.name) : undefined,
      login: !!sess.userId,
      repoAdmin: sess.repoAdmin,
      admin: sess.actor === 2,
    },
  });
}

const getRouteContext = (ctx, store) =>
  new Promise((resolve, reject) => {
    match({
      routes: routes(store),
      location: ctx.originalUrl,
    }, (error, redirect, renderProps) => {
      if (error) {
        reject(error);
      } else if (redirect) {
        reject({
          name: 'redirect',
          url: redirect.pathname + redirect.search,
        });
      } else if (renderProps) {
        watcher('app-visit', 1);

        // 支持 material-ui 的 server-render
        global.navigator = {
          userAgent: ctx.req.headers['user-agent'],
        };

        // 使用 div 包裹是为了前端的 devTools 的渲染
        const component = (
          <Provider store={store} key="provider">
            <div>
              <RouterContext {...renderProps} />
              <div />
            </div>
          </Provider>
        );

        const def = fetchServerData(renderProps, store);
        // 服务端发送登录信息
        dispatchUserInfo(store, ctx.session);

        const render = () => `<!DOCTYPE html>\n${
          ReactDOM.renderToString(
            <Html
              assets={webpackIsomorphicTools.assets()}
              component={component}
              store={store}
              title="yicon - 矢量图标库"
              authType="qsso"
            />
        )}`;

        if (def.length) {
          Promise
            .all(def)
            .then(() => resolve(render()))
            .catch(e => reject(e));
        } else {
          resolve(render());
        }
      } else {
        reject(new Error('NOT_MATCH'));
      }
    });
  });

app.use(function* s(next) {
  if (/^\/api/.test(this.url)) {
    yield next;
  } else {
    if (__DEVELOPMENT__) {
      webpackIsomorphicTools.refresh();
    }
    const store = createStore();
    isomFetch.use(this, router);
    try {
      const result = yield getRouteContext(this, store);
      this.body = result;
    } catch (e) {
      if (e.name === 'redirect') {
        this.redirect(e.url);
      } else {
        this.body = e.stack;
      }
    }
  }
});

app.listen(PORT, (err) => {
  if (err) {
    logger.error(err);
  } else {
    logger.info('==> 🐸  Server listening on port %s', PORT);
  }
});
