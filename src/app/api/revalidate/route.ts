import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

const DEFAULT_PATHS = ["/", "/diary", "/resources"] as const;
const DIARY_ENDPOINTS = new Set(["diary", "diaries", "blogs", "math-diary", "math_diary"]);

export async function GET(request: NextRequest) {
  const secretValidation = validateSecret(request);
  if (secretValidation) return secretValidation;

  const pathParams = request.nextUrl.searchParams.getAll("path");
  const pathSet = new Set<string>(pathParams.length > 0 ? pathParams : DEFAULT_PATHS);
  return sendRevalidateResponse(pathSet);
}

export async function POST(request: NextRequest) {
  const secretValidation = validateSecret(request);
  if (secretValidation) return secretValidation;

  const body = await request.json().catch(() => null);
  const basePaths = body?.paths ?? DEFAULT_PATHS;
  const pathSet = new Set<string>(basePaths);

  if (body && typeof body === "object") {
    const apiName = String(body.api ?? body.endpoint ?? "").toLowerCase();
    const slug =
      body.contents?.slug ??
      body.contents?.new?.slug ??
      body.newContents?.slug ??
      body.slug ??
      body.id ??
      body.contentsId;

    if (slug) {
      pathSet.add(`/diary/${slug}`);
    }

    if (DIARY_ENDPOINTS.has(apiName)) {
      const contentId = body.id ?? body.contentsId ?? body.contents?.id ?? body.newContents?.id;
      if (contentId && contentId !== slug) {
        pathSet.add(`/diary/${contentId}`);
      }
    }
  }

  return sendRevalidateResponse(pathSet);
}

function validateSecret(request: NextRequest): NextResponse | null {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }
  return null;
}

async function sendRevalidateResponse(pathSet: Set<string>) {
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
