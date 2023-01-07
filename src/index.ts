import * as net from 'net';

let peerToServer: net.Socket;
let target: net.Socket;

const connectToHub = () => {
  peerToServer = net.connect(8002, 'localhost', () => {});
  peerToServer.on('data', (data) => {
    const cmd = data.toString().substring(0, 3);
    if (cmd === 'GO!') {
      const targetUrl = data.toString().split(' ')[1];
      target = net.createConnection(443, targetUrl, function () {});
      peerToServer.pipe(target);
      target.pipe(peerToServer);
    }
  });

  peerToServer.on('close', () => {
    console.log('recycling peer');
    connectToHub();
  });
};

connectToHub();
