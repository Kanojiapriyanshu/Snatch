export async function fetchInstagramMedia(code, after = null, sort = "date", page = null) {
  try {
    let url = `/api/auth/instagram/callback?code=${code}&sort=${sort}`;
    if (page !== null) url += `&page=${page}`;
    if (after) url += `&after=${after}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data?.mediaData) {
      return { media: data.mediaData, paging: data.paging, mediaCount: data.mediaCount, connected: data.connected };
    }
  } catch (error) {
    console.error("Error fetching Instagram media:", error);
    throw error;
  }
}