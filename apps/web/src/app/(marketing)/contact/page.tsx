"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Input,
} from "@marketpilot/ui";
import { Send, Mail, MessageSquare, Clock } from "lucide-react";

const channels = [
  {
    icon: Mail,
    title: "Email Support",
    description: "General inquiries and account questions",
    detail: "support@marketpilot.ai",
  },
  {
    icon: MessageSquare,
    title: "Technical Support",
    description: "Strategy configuration, API, and integration help",
    detail: "tech@marketpilot.ai",
  },
  {
    icon: Clock,
    title: "Response Times",
    description: "We aim to respond within one business day",
    detail: "Priority support for Operator plan subscribers",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <Badge variant="default" className="mb-6">
            Contact
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-surface-900">
            Get in Touch
          </h1>
          <p className="mt-6 text-lg text-surface-700 max-w-2xl mx-auto">
            Have a question about MarketPilot? Need help with your account or a
            strategy configuration? Reach out and we will get back to you.
          </p>
        </div>
      </section>

      {/* ── Contact Channels + Form ───────────────────────────────────── */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Channels */}
            <div className="lg:col-span-2 space-y-6">
              {channels.map((channel) => (
                <div key={channel.title} className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-brand-600/10 flex items-center justify-center shrink-0">
                    <channel.icon className="h-5 w-5 text-brand-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-surface-900">
                      {channel.title}
                    </h3>
                    <p className="text-sm text-surface-700 mt-0.5">
                      {channel.description}
                    </p>
                    <p className="text-sm text-surface-600 mt-1">
                      {channel.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Send a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we will respond as soon as
                    possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="py-8 text-center">
                      <div className="h-12 w-12 rounded-full bg-brand-600/10 flex items-center justify-center mx-auto mb-4">
                        <Send className="h-6 w-6 text-brand-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-surface-900">
                        Message Sent
                      </h3>
                      <p className="mt-2 text-sm text-surface-700">
                        Thank you for reaching out. We will get back to you
                        within one business day.
                      </p>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setSubmitted(true);
                      }}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          id="name"
                          label="Name"
                          placeholder="Your name"
                          required
                        />
                        <Input
                          id="email"
                          label="Email"
                          type="email"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                      <Input
                        id="subject"
                        label="Subject"
                        placeholder="How can we help?"
                        required
                      />
                      <div className="space-y-1.5">
                        <label
                          htmlFor="message"
                          className="text-sm font-medium text-surface-800"
                        >
                          Message
                        </label>
                        <textarea
                          id="message"
                          rows={5}
                          required
                          placeholder="Describe your question or issue..."
                          className="flex w-full rounded-lg border border-surface-400 bg-surface-100 px-3 py-2 text-sm text-surface-900 placeholder:text-surface-600 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors resize-none"
                        />
                      </div>
                      <Button type="submit" size="lg" className="w-full">
                        Send Message
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
