
export const getUrl = (urlOrPort: string): string => {
  if (urlOrPort.match(/^\d+$/)) return `http://localhost:${urlOrPort}`;
  return urlOrPort;
}
