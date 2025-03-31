import { createBrowserSupabase } from '../../../utils/supabase/supabaseClient'

const supabase = createBrowserSupabase();

export default async function BlogPage({ params }) {
  const { id } = params;

  const { data: blog, error } = await supabase
    .from("blogs")
    .select("*, categories(name)")
    .eq("id", id)
    .single();

  if (error || !blog) {
    return <div className="text-center text-gray-500 mt-10">Blog not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 bg-white shadow-lg rounded-lg p-6">
      <h1 className="text-3xl font-bold text-gray-900">{blog.title}</h1>
      <p className="text-gray-600 mt-2">{blog.description}</p>
      <p className="mt-4 text-sm text-gray-500">
        Category: {blog.categories?.name || "Uncategorized"}
      </p>
    </div>
  );
}
