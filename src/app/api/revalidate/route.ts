import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const basePaths = body?.paths ?? ["/", "/diary", "/resources"];
  const pathSet = new Set<string>(basePaths);

  if (body && typeof body === "object") {
    const diaryEndpoints = new Set(["diary", "diaries", "blogs"]);
    const apiName = (body.api ?? body.endpoint ?? "") as string;
    const isDiaryPayload = diaryEndpoints.has(apiName);

    if (isDiaryPayload) {
      const slug =
        body.contents?.slug ?? body.contents?.new?.slug ?? body.newContents?.slug ?? body.slug ?? body.id ?? body.contentsId;
      if (slug) {
        pathSet.add(`/diary/${slug}`);
      }

      const contentId = body.id ?? body.contentsId ?? body.contents?.id ?? body.newContents?.id;
      if (contentId) {
        pathSet.add(`/diary/${contentId}`);
      }
    }
  }

  const paths = Array.from(pathSet);

  try {
    await Promise.all(paths.map((path) => revalidatePath(path)));
    return NextResponse.json({ revalidated: true, paths });
  } catch (error) {
    return NextResponse.json(
      {
        revalidated: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
