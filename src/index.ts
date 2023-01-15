import * as net from 'net';

let server: net.Socket;
let target: net.Socket;

const connectToHub = () => {
  try {
    if (server && server.readyState === 'open') return;
    console.log('reconnect attempt');
    server = net.createConnection({ allowHalfOpen: false, host: 'localhost', port: 8002 }, () => {});
    server.write('IDENTIF');
    server.on('data', (data) => {
      const cmd = data.toString().substring(0, 3);
      if (cmd === 'GO!') {
        const targetUrl = data.toString().split(' ')[1];
        target = net.createConnection({ allowHalfOpen: false, port: 443, host: targetUrl }, function () {});
        server.pipe(target);
        target.pipe(server);
      } else if (cmd === 'GO2') {
        const targetUrl = data.toString().split(' ')[1];

        target = net.createConnection({ allowHalfOpen: false, port: 80, host: targetUrl }, function () {});
        target.pipe(server);
        server.write('OK');
        server.pipe(target);
      } else {
        console.log('data', data.toString());
      }
    });

    server.on('close', () => {
      console.log('auto reconnect');
      connectToHub();
    });
  } catch (e) {
    console.error(e);
  }
};

setInterval(() => {
  connectToHub();
}, 1000);
