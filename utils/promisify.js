module.exports = (object) => {
  return new Proxy(object, {
    get: (target, property) => {
      const accessed = target[property];
      if(typeof accessed === 'function'){
        return (...args) => {
          return new Promise((resolve, reject) => {
            accessed.apply(target, [...args, (error, data) => {
              if(error) {
                reject(error);
              }
              else {
                resolve(data);
              }
            }]);
          });
        }
      }
      else {
        return accessed;
      }
    }
  });
};
