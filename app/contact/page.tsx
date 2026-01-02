import ContactForm from "@/components/contact/ContactForm";
import FeatureCard from "@/components/contact/FeatureCard";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-gray-900 py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl font-black text-white text-center mb-4">
          Get Legend Access
        </h1>
        <p className="text-gray-400 text-center mb-12">
          Enterprise-grade code review for your team
        </p>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border-4 border-purple-500/50 p-8">
          <ContactForm />
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <FeatureCard
            icon="🎯"
            title="Unlimited Everything"
            description="No limits on submissions, file size, or features"
          />
          <FeatureCard
            icon="👥"
            title="Team Collaboration"
            description="Invite team members, share reviews, track progress"
          />
          <FeatureCard
            icon="🔧"
            title="Custom Integrations"
            description="GitHub, GitLab, Bitbucket, CI/CD pipelines"
          />
          <FeatureCard
            icon="📞"
            title="Dedicated Support"
            description="Direct line to our engineering team"
          />
          <FeatureCard
            icon="📊"
            title="Advanced Analytics"
            description="Team metrics, trends, custom reports"
          />
          <FeatureCard
            icon="🛡️"
            title="SLA Guarantee"
            description="99.9% uptime, priority infrastructure"
          />
        </div>
      </div>
    </div>
  );
}
