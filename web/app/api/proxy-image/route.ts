import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const imageURL = searchParams.get("url");

  if (!imageURL) {
    return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
  }

  try {
    // Decode the URL to handle any encoding issues
    const decodedURL = decodeURIComponent(imageURL);
    
    const response = await fetch(decodedURL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "identity", // Disable compression
        "Referer": "https://www.instagram.com/",
        "DNT": "1",
        "Connection": "keep-alive",
        "Sec-Fetch-Dest": "image",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
      },
      // Allow redirects to handle CDN redirects
      redirect: "follow",
    });

    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      return NextResponse.json({ error: "Failed to fetch image" }, { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    
    // Determine content type from the response, or guess from URL extension
    let contentType = response.headers.get("content-type");
    
    if (!contentType) {
      // Guess content type from URL
      if (decodedURL.includes(".jpg") || decodedURL.includes(".jpeg")) {
        contentType = "image/jpeg";
      } else if (decodedURL.includes(".png")) {
        contentType = "image/png";
      } else if (decodedURL.includes(".gif")) {
        contentType = "image/gif";
      } else if (decodedURL.includes(".webp")) {
        contentType = "image/webp";
      } else {
        contentType = "image/jpeg"; // Default fallback
      }
    }

    // Set appropriate CORS headers to allow the image to be displayed
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400", // Cache for 1 day
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error proxying image:", error);
    return NextResponse.json({ 
      error: "Failed to proxy image", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

