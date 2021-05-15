var PROXY_DIRECT = "DIRECT";
var DIRECT = "DIRECT";
var BLACK = "PROXY 127.0.0.1:8021";
var WHITE = PROXY_DIRECT;

function FindProxyForURL(url, host) {
  if (dnsDomainIs(host, "vnexpress.net")) {
    return BLACK;
  }
  return PROXY_DIRECT;
}
