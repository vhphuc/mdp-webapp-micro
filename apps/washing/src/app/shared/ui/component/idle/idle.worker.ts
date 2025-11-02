/// <reference lib="webworker" />

const workerId = Math.random() * 100;

addEventListener('message', ({ data }) => {
  const response = `Worker ID '${workerId}' running, ${data}`;
  setInterval(() => {
    postMessage(response);
  }, 1000);
});
