"use client";

import Link from "next/link";
import { FaSun } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { createBrowserSupabase } from "../../../utils/supabase/supabaseClient";

const supabase = createBrowserSupabase();

export default function HomePage() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Blogs
  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*,categories(name)");
      if (error) throw error;
      setData(data || []);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold text-gray-700">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <FaSun className="text-yellow-500" />
          <span>Aftab</span>
        </div>
        <div className="flex gap-4">
          <Link
            href="/signup"
            className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="max-w-6xl mx-auto mt-10 text-center">
        <h1 className="text-4xl font-semibold text-gray-900">
          Welcome to Aftab Platform
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Explore the latest blogs and insights.
        </p>
      </section>

      {/* Blogs Section */}
      <div className="max-w-4xl mx-auto mt-12 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-4">
          Latest Blogs
        </h2>
        <div className="space-y-6">
          {data.length > 0 ? (
            data.map((item) => (
              <div key={item.id} className="border-b pb-4 last:border-b-0">
                <Link href={`/blog/${item.id}`}>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {item.title}
                  </h3>
                </Link>
                <p className="text-gray-700 mt-2">{item.description}</p>
                <p className="mt-2 text-sm text-gray-500">
                  Category: {item.categories?.name || "Uncategorized"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No blogs found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
