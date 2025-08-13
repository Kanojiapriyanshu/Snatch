export async function getMediaFromDatabase() {
    try {
        const response = await fetch('/api/auth/get-media');
        console.log("response", response);
        const data = await response.json();
        console.log("Instagram media data:", data);
        if (data?.mediaData) {
      return {
        mediaData: data.mediaData,
        mediaCount: data.mediaCount || 0 // default to 0 if not present
        };
      } else {
        return {
          mediaData: [],
          mediaCount: 0
        };
      }
       
      } catch (error) {
        console.error("Error fetching Instagram media:", error);
        throw error;
      }
}