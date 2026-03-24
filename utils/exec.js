const { exec } = require("child_process");

function execPromise(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(
      command,
      {
        windowsHide: true,
        maxBuffer: 1024 * 1024 * 10,
        ...options
      },
      (err, stdout, stderr) => {
        if (err) {
          return reject(new Error(stderr || err.message));
        }
        resolve(stdout);
      }
    );
  });
}

module.exports = {
  execPromise
};