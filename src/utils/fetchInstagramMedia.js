export async function fetchInstagramMedia(code, after = null) {
  try {
    let url = `/api/auth/instagram/callback?code=${code}`;
    if (after) url += `&after=${after}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data?.mediaData) {
      return { media: data.mediaData, paging: data.paging };
    }
  } catch (error) {
    console.error("Error fetching Instagram media:", error);
    throw error;
  }
}