"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await login(formData);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* Navbar */}
      <nav className="w-full max-w-3xl p-4 flex justify-between bg-white shadow-md rounded-xl">
        <Link href="/" className="font-semibold text-lg">Home</Link>
        <Link href="/private" className="font-semibold text-lg">Private</Link>
        <Link href="/login" className="font-semibold text-lg">Login</Link>
      </nav>
      
      {/* Login Card */}
      <div className="w-full max-w-md mt-10 p-6 bg-white shadow-lg rounded-xl">
        <h2 className="text-2xl font-semibold text-center mb-4">Sign in</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email:</label>
            <input id="email" name="email" type="email" required className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">Password:</label>
            <input id="password" name="password" type="password" required className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Log in</button>
        </form>
        <button className="w-full mt-2 flex items-center justify-center gap-2 border py-2 rounded-md hover:bg-gray-100">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12.1c0-.8-.1-1.5-.2-2.2H12v4.2h5.7c-.3 1.3-1 2.3-2 3l3 2.3c1.8-1.7 2.9-4.1 2.9-7.3z"/><path d="M12 22c2.5 0 4.7-.8 6.3-2.2l-3-2.3c-.8.5-1.9.8-3.3.8-2.5 0-4.6-1.7-5.4-3.9H3.5v2.4C5 19 8.2 22 12 22z"/><path d="M6.6 13.6C6.4 13 6.3 12.5 6.3 12s.1-1 .2-1.5V8H3.5C2.6 9.8 2 11.8 2 12s.6 2.2 1.5 4h3.1z"/><path d="M12 5.8c1.4 0 2.7.5 3.8 1.5l2.8-2.8C16.7 2 14.5 1 12 1 8.2 1 5 4 3.5 8h3.1C7.4 5.7 9.5 3.8 12 3.8z"/></svg>
          Log in with Github
        </button>
        <div className="text-center mt-4 text-sm">
          <p>
            Don’t have an account? <Link href="/signup" className="text-blue-600 hover:underline">Sign up</Link>
          </p>
          <p>
            Forgot your password? <Link href="/reset" className="text-blue-600 hover:underline">Reset password</Link>
          </p>
        </div>
      </div>
    </div>
  );
}