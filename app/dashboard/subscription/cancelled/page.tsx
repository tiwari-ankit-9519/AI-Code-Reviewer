import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { XCircle, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SubscriptionCancelledPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-gray-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900">
      <Card className="max-w-2xl w-full border-2 border-orange-200 dark:border-orange-800 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-20 h-20 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
            <XCircle className="h-12 w-12 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <CardTitle className="text-4xl font-black mb-2 bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Payment Cancelled
            </CardTitle>
            <CardDescription className="text-lg">
              Your subscription upgrade was not completed
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-3">What Happened?</h3>
            <p className="text-muted-foreground mb-4">
              You cancelled the payment process before completion. No charges
              were made to your account.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-orange-600">•</span>
                <span>Your account remains on the current plan</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600">•</span>
                <span>No payment information was stored</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600">•</span>
                <span>You can try again anytime</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              Common Questions
            </h3>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-sm">
                  Was I charged for anything?
                </p>
                <p className="text-sm text-muted-foreground">
                  No, the payment process was cancelled before any charges were
                  made.
                </p>
              </div>
              <div>
                <p className="font-semibold text-sm">Can I try again?</p>
                <p className="text-sm text-muted-foreground">
                  Yes, you can upgrade anytime from your subscription settings.
                </p>
              </div>
              <div>
                <p className="font-semibold text-sm">
                  What if I had an issue during checkout?
                </p>
                <p className="text-sm text-muted-foreground">
                  Contact our support team if you experienced any technical
                  problems.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-3">
              💡 Still Want to Upgrade?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our Hero plan includes unlimited code reviews, advanced security
              checks, and priority support. Upgrade anytime to unlock these
              features.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">Starting at</span>
              <span className="text-2xl font-black text-purple-600">₹2999</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1" size="lg">
              <Link href="/dashboard/subscription">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Try Again
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1" size="lg">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Having trouble?{" "}
              <Link
                href="/contact"
                className="text-primary hover:underline font-medium"
              >
                Contact support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
