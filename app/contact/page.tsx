import ContactForm from "@/components/contact/ContactForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Users, Wrench, Phone, BarChart3, Shield } from "lucide-react";

export default function ContactPage() {
  const features = [
    {
      icon: Target,
      title: "Unlimited Everything",
      description: "No limits on submissions, file size, or features",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Invite team members, share reviews, track progress",
    },
    {
      icon: Wrench,
      title: "Custom Integrations",
      description: "GitHub, GitLab, Bitbucket, CI/CD pipelines",
    },
    {
      icon: Phone,
      title: "Dedicated Support",
      description: "Direct line to our engineering team",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Team metrics, trends, custom reports",
    },
    {
      icon: Shield,
      title: "SLA Guarantee",
      description: "99.9% uptime, priority infrastructure",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Get Legend Access
          </h1>
          <p className="text-muted-foreground text-lg">
            Enterprise-grade code review for your team
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Contact Our Team</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
