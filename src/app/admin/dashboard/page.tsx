import { createClient } from "@/lib/supabase/server";
import { FileText, FilePlus, Eye } from "lucide-react";
import Link from "next/link";

async function getDashboardStats() {
  const supabase = await createClient();

  // Get total count
  const { count: totalCount } = await supabase
    .from("diary")
    .select("*", { count: "exact", head: true });

  // Get draft count
  const { count: draftCount } = await supabase
    .from("diary")
    .select("*", { count: "exact", head: true })
    .eq("status", "draft");

  // Get published count
  const { count: publishedCount } = await supabase
    .from("diary")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  // Get total views
  const { data: viewData } = await supabase.from("diary").select("view_count");
  const totalViews = viewData?.reduce((sum, item) => sum + (item.view_count || 0), 0) || 0;

  // Get recent posts
  const { data: recentPosts } = await supabase
    .from("diary")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    totalCount: totalCount || 0,
    draftCount: draftCount || 0,
    publishedCount: publishedCount || 0,
    totalViews,
    recentPosts: recentPosts || [],
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
        <Link
          href="/admin/diary/new"
          className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 font-medium text-night transition-colors hover:bg-accent/90"
        >
          <FilePlus className="h-4 w-4" />
          New Post
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-night-muted bg-night-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Posts</p>
              <p className="mt-2 text-3xl font-bold text-gray-100">{stats.totalCount}</p>
            </div>
            <FileText className="h-8 w-8 text-accent" />
          </div>
        </div>

        <div className="rounded-lg border border-night-muted bg-night-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Published</p>
              <p className="mt-2 text-3xl font-bold text-green-400">{stats.publishedCount}</p>
            </div>
            <FileText className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="rounded-lg border border-night-muted bg-night-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Drafts</p>
              <p className="mt-2 text-3xl font-bold text-yellow-400">{stats.draftCount}</p>
            </div>
            <FilePlus className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="rounded-lg border border-night-muted bg-night-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Views</p>
              <p className="mt-2 text-3xl font-bold text-blue-400">{stats.totalViews}</p>
            </div>
            <Eye className="h-8 w-8 text-blue-400" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-night-muted bg-night-soft p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-100">Recent Posts</h2>
        {stats.recentPosts.length === 0 ? (
          <p className="text-gray-400">No posts yet. Create your first post!</p>
        ) : (
          <div className="space-y-3">
            {stats.recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/admin/diary/${post.id}/edit`}
                className="flex items-center justify-between rounded-md border border-night-muted p-4 transition-colors hover:bg-night"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-100">{post.title}</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    {post.status === "published" ? "Published" : "Draft"} •{" "}
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.view_count || 0}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
