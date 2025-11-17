import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const paths: string[] = body?.paths ?? ["/", "/diary", "/resources"];

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
