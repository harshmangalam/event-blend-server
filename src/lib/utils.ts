async function reverseGeocodingAPI(lat: number, lon: number) {
  const resp = await fetch(
    `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${Bun.env.GEOAPIFY_API_KEY}`
  );
  if (resp.ok) {
    const jsonResp = await resp.json();
    const data = jsonResp?.features[0]?.properties;
    return data;
  }
}

function getExpTimestamp(seconds: number) {
  const currentTimeMillis = Date.now();
  const secondsIntoMillis = seconds * 1000;
  const expirationTimeMillis = currentTimeMillis + secondsIntoMillis;

  return Math.floor(expirationTimeMillis / 1000);
}

function extractDuplicatePrismaField(message: string) {
  const field = message.split("fields:");
  const regex = /`([^`]+)`/;
  const match = field[1].match(regex);
  if (match) {
    const extractedText = match?.[1];
    return extractedText as string;
  }
  return null;
}
export { reverseGeocodingAPI, getExpTimestamp, extractDuplicatePrismaField };
