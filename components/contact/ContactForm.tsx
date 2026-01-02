// FILE PATH: components/contact/ContactForm.tsx

"use client";

import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { submitEnterpriseContact } from "@/lib/actions/enterprise-contact";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      company: formData.get("company") as string,
      teamSize: formData.get("teamSize") as string,
      useCase: formData.get("useCase") as string,
      message: formData.get("message") as string,
    };

    try {
      await submitEnterpriseContact(data);
      setSuccess(true);
      toast.success("Thanks! We'll contact you within 24 hours");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-black text-white mb-2">Message Sent!</h3>
        <p className="text-gray-400">We&apos;ll be in touch within 24 hours</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-black text-gray-300 mb-2">
            Name *
          </label>
          <input
            type="text"
            name="name"
            required
            className="w-full px-4 py-3 bg-gray-900 border-2 border-purple-500/30 rounded-xl text-white focus:border-purple-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-black text-gray-300 mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full px-4 py-3 bg-gray-900 border-2 border-purple-500/30 rounded-xl text-white focus:border-purple-500 outline-none"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-black text-gray-300 mb-2">
            Company
          </label>
          <input
            type="text"
            name="company"
            className="w-full px-4 py-3 bg-gray-900 border-2 border-purple-500/30 rounded-xl text-white focus:border-purple-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-black text-gray-300 mb-2">
            Team Size
          </label>
          <select
            name="teamSize"
            className="w-full px-4 py-3 bg-gray-900 border-2 border-purple-500/30 rounded-xl text-white focus:border-purple-500 outline-none"
          >
            <option>1-10</option>
            <option>11-50</option>
            <option>51-200</option>
            <option>201-1000</option>
            <option>1000+</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-black text-gray-300 mb-2">
          Use Case *
        </label>
        <textarea
          name="useCase"
          required
          rows={3}
          className="w-full px-4 py-3 bg-gray-900 border-2 border-purple-500/30 rounded-xl text-white focus:border-purple-500 outline-none resize-none"
          placeholder="Tell us about your code review needs..."
        />
      </div>

      <div>
        <label className="block text-sm font-black text-gray-300 mb-2">
          Additional Message
        </label>
        <textarea
          name="message"
          rows={4}
          className="w-full px-4 py-3 bg-gray-900 border-2 border-purple-500/30 rounded-xl text-white focus:border-purple-500 outline-none resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 py-4 rounded-xl font-black text-lg disabled:opacity-50 hover:shadow-lg hover:shadow-yellow-500/50 transition-all"
      >
        {loading ? "Sending..." : "Contact Sales"}
      </button>
    </form>
  );
}
