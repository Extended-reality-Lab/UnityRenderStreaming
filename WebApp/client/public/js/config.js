export async function getServerConfig() {
  const protocolEndPoint = location.origin + '/config';
  const createResponse = await fetch(protocolEndPoint);
  return await createResponse.json();
}

export function getRTCConfiguration() {
  let config = {};
  config.sdpSemantics = 'unified-plan';
  config.iceServers = [
  { urls: ['stun:stun.l.google.com:19302'] },
  { urls: ['turn:147.182.229.16:3478'], username: 'username', credential: 'password' }
  ];
  return config;
}
