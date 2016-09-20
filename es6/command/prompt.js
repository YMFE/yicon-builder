import coPrompt from 'co-prompt';

// 由于 co-prompt 返回的是一个 thunk 函数，需要将其封装为 Promise 对象
const promiseWrapper = fun => (...args) =>
  new Promise((resolve, reject) => {
    const thunk = fun(...args);
    thunk((error, ...rest) => {
      error === null ? resolve(...rest) : reject(error);
    });
  });

const prompt = promiseWrapper(coPrompt);

export default prompt;
export const password = promiseWrapper(coPrompt.password);
export const multiline = promiseWrapper(coPrompt.multiline);
export const confirm = promiseWrapper(coPrompt.confirm);
