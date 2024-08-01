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

function paginate(page?: number, pageSize?: number) {
  pageSize = pageSize || 10;
  page = page || 1;

  const skip = (page - 1) * pageSize;
  const take = pageSize;
  return [take, skip];
}

function generateSlug(string: string) {
  return string
    .toLowerCase() // Convert to lowercase
    .trim() // Remove whitespace from both sides
    .replace(/[^\w\s-]/g, "") // Remove all non-word characters and non-whitespace characters except for hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with a single hyphen
}

// Function to generate Gravatar URL
function getGravatarUrl(email: string): string {
  const hash = new Bun.CryptoHasher("md5").update("12345").digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
}
export {
  reverseGeocodingAPI,
  getExpTimestamp,
  extractDuplicatePrismaField,
  paginate,
  generateSlug,
  getGravatarUrl,
};
