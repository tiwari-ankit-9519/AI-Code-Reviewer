"use client";

import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { submitEnterpriseContact } from "@/lib/actions/enterprise-contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [teamSize, setTeamSize] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      company: formData.get("company") as string,
      teamSize: teamSize,
      useCase: formData.get("useCase") as string,
      message: formData.get("message") as string,
    };

    try {
      await submitEnterpriseContact(data);
      setSuccess(true);
      toast.success("Thanks! We'll contact you within 24 hours");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send message",
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-primary rounded-full mx-auto flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
        <p className="text-muted-foreground">
          We&apos;ll be in touch within 24 hours
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="john@company.com"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            name="company"
            type="text"
            placeholder="Your Company Inc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamSize">Team Size</Label>
          <Select value={teamSize} onValueChange={setTeamSize}>
            <SelectTrigger id="teamSize">
              <SelectValue placeholder="Select team size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10</SelectItem>
              <SelectItem value="11-50">11-50</SelectItem>
              <SelectItem value="51-200">51-200</SelectItem>
              <SelectItem value="201-1000">201-1000</SelectItem>
              <SelectItem value="1000+">1000+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="useCase">
          Use Case <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="useCase"
          name="useCase"
          required
          rows={3}
          placeholder="Tell us about your code review needs..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Additional Message</Label>
        <Textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Any additional information you'd like to share..."
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          "Contact Sales"
        )}
      </Button>
    </form>
  );
}
