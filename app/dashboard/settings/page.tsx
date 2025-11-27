import { getUserProfile } from "@/lib/actions/user";
import { SettingsForm } from "@/components/settings-form";
import { PasswordForm } from "@/components/password-form";
import { DeleteAccountButton } from "@/components/delete-account-button";

export default async function SettingsPage() {
  const user = await getUserProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#15192c]">Settings</h1>
        <p className="text-[#6c7681] mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-[#ececec] shadow-sm">
            <div className="px-6 py-4 border-b border-[#ececec]">
              <h2 className="text-lg font-semibold text-[#15192c]">
                Profile Information
              </h2>
              <p className="text-sm text-[#6c7681] mt-1">
                Update your account details
              </p>
            </div>
            <div className="p-6">
              <SettingsForm user={user} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#ececec] shadow-sm">
            <div className="px-6 py-4 border-b border-[#ececec]">
              <h2 className="text-lg font-semibold text-[#15192c]">
                Change Password
              </h2>
              <p className="text-sm text-[#6c7681] mt-1">
                Update your password to keep your account secure
              </p>
            </div>
            <div className="p-6">
              <PasswordForm />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-red-200 shadow-sm">
            <div className="px-6 py-4 border-b border-red-200">
              <h2 className="text-lg font-semibold text-red-600">
                Danger Zone
              </h2>
              <p className="text-sm text-[#6c7681] mt-1">
                Permanently delete your account and all data
              </p>
            </div>
            <div className="p-6">
              <DeleteAccountButton />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-[#ececec] shadow-sm p-6">
            <h3 className="text-sm font-semibold text-[#15192c] mb-4">
              Account Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#6c7681] mb-1">Member Since</p>
                <p className="text-sm font-medium text-[#15192c]">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#6c7681] mb-1">Total Reviews</p>
                <p className="text-sm font-medium text-[#15192c]">
                  {user._count.submissions}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#6c7681] mb-1">Email Status</p>
                <div className="flex items-center gap-2">
                  {user.emailVerified ? (
                    <>
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-green-600">
                        Verified
                      </span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-yellow-600">
                        Not Verified
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  Privacy & Security
                </h4>
                <p className="text-xs text-blue-800">
                  Your code submissions are private and encrypted. We never
                  share your data with third parties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
