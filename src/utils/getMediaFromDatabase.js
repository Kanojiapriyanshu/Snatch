
// utils/getMediaFromDatabase.ts
export async function getMediaFromDatabase(after = null, limit= 20, sort = "date", page = null) {
  try {
    // Include cursor + limit + sort in query string
    const query = new URLSearchParams({ limit: limit.toString(), sort: sort });
    if (page !== null) query.append("page", page.toString());
    if (after) query.append("after", after);

    //const response = await fetch(`/api/auth/get-media?${query.toString()}`);
    const response = await fetch(`/api/auth/get-media?${query.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.status}`);
    }

    const data = await response.json();
    console.log("Instagram media data from DB:", data);

    return {
      media: data?.mediaData || [],     // array of posts
      paging: data?.paging || null,     // paging info (with cursors)
      mediaCount: data?.mediaCount || 0
    };

  } catch (error) {
    console.error("Error fetching Instagram media from DB:", error);
    return {
      media: [],
      paging: null,
      mediaCount: 0
    };
  }
}

