"use client";

import { createClient } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Make sure to import CSS for toast

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const UserDashboard = () => {
  const { logout } = useAuth();

  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // Get current user  
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      }
      setUser(user);
    };
    getCurrentUser();
  }, []);

  // Fetch Blogs
  const fetchData = async () => {
    try {
      if (!user) return;
      const { data, error } = await supabase
        .from("blogs")
        .select("*,categories(name)")
        .eq("user_id", user.id);
      if (error) throw error;
      setData(data || []);
    } catch (error) {
      console.error("Error fetching data:", error.message);
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
      
      // Set up realtime subscription
      const blogChannel = supabase
        .channel('blogs-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'blogs',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Change received!', payload);
            
            // Handle different types of changes
            if (payload.eventType === 'INSERT') {
              toast.success("New blog has been added");
              // Add the new blog to the state with category info
              // Since we don't have category info in the payload, we'll refresh data
              fetchData();
            } else if (payload.eventType === 'UPDATE') {
              toast.success("A blog has been updated");
              // Update the existing blog in state
              setData(prev => 
                prev.map(blog => 
                  blog.id === payload.new.id ? { ...payload.new, categories: blog.categories } : blog
                )
              );
            } else if (payload.eventType === 'DELETE') {
              toast.success("A blog has been deleted");
              // Remove the deleted blog from state
              setData(prev => prev.filter(blog => blog.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      // Clean up subscription on unmount
      return () => {
        supabase.removeChannel(blogChannel);
      };
    }
  }, [user]);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error.message);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    
    // Set up realtime subscription for categories as well
    const categoryChannel = supabase
      .channel('categories-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories'
        },
        (payload) => {
          console.log('Category change received!', payload);
          fetchCategories(); // Refresh categories
          toast.success("Categories have been updated");
        }
      )
      .subscribe();
      
    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(categoryChannel);
    };
  }, []);

  // Insert and Update Blog
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) throw new Error("User not authenticated");

      if (editMode) {
        // Update existing blog post
        const { error } = await supabase
          .from("blogs")
          .update({
            title,
            description,
            category_id: selectedCategory,
          })
          .eq("id", editId)
          .eq("user_id", user.id);

        if (error) throw error;

        toast.success("Blog updated successfully!");
        setEditMode(false);
        setEditId(null);
      } else {
        // Insert new blog post
        const { error } = await supabase
          .from("blogs")
          .insert([
            { title, description, category_id: selectedCategory, user_id: user.id },
          ]);

        if (error) throw error;
        
        toast.success("Blog published successfully!");
      }

      // Clear the form
      setTitle("");
      setDescription("");
      setSelectedCategory("");
      
      // We don't need to manually fetch data here anymore since the realtime subscription will handle it
      // However, keeping it for immediate UI update without waiting for realtime events
      fetchData();
    } catch (error) {
      console.error("Error submitting blog:", error.message);
      toast.error(`Failed to save blog: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update Blog -- Single data fetch
  const handleEdit = async (id) => {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setTitle(data.title);
      setDescription(data.description);
      setSelectedCategory(data.category_id);
      setEditMode(true);
      setEditId(id);
      
      toast.success("Editing blog post");
    } catch (error) {
      console.error("Error fetching blog:", error.message);
      toast.error("Could not load blog data for editing");
    }
  };

  // Delete Blog
  const handleDelete = async (id) => {
    if (!id || !user) return;

    if (!window.confirm("Are you sure you want to delete this blog?")) {
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from("blogs")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      
      // The UI will be updated by the realtime subscription
      toast.success("Blog deleted successfully");
    } catch (error) {
      console.error("Error deleting data:", error.message);
      toast.error(`Failed to delete blog: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold bg-gray-100">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-4 py-8">
      {/* Header Section */}
      <header className="max-w-6xl mx-auto flex justify-between items-center bg-white p-6 rounded-2xl shadow-lg mb-8">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
        <div className="flex gap-3">
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
          >
            Log Out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Insert Section */}
        <div className="bg-white shadow-xl rounded-2xl p-8 h-fit">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3 border-gray-200">
            {editMode ? "Edit Blog" : "Create New Blog"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter blog title"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Write your blog description"
              ></textarea>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                disabled={loading}
              >
                {loading ? "Submitting..." : editMode ? "Update Blog" : "Publish Blog"}
              </button>
              
              {editMode && (
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setEditId(null);
                    setTitle("");
                    setDescription("");
                    setSelectedCategory("");
                  }}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition duration-300"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Blogs Section */}
        <div className="bg-white shadow-xl rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200">
            Your Blogs
            {
              data.length > 0 && (` (${data.length})`)
            }
          </h1>
          <div className="space-y-6">
            {data.length > 0 ? (
              data.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 p-5 rounded-lg border border-gray-200 hover:shadow-md transition duration-300"
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {item.title}
                  </h2>
                  <p className="text-gray-600 mb-3">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {item.categories?.name || "Uncategorized"}
                    </span>
                    <div className="flex gap-2">
                      <button
                        className="bg-yellow-500 px-4 py-2 text-white rounded-md hover:bg-yellow-600 transition duration-300 ease-in-out"
                        onClick={() => handleEdit(item.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 px-4 py-2 text-white rounded-md hover:bg-red-600 transition duration-300 ease-in-out"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-10">
                No blogs have been created yet. Start writing!
              </p>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default UserDashboard;