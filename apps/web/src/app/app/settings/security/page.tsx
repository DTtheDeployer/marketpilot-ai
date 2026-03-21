"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Button,
  Input,
} from "@marketpilot/ui";
import {
  Lock,
  Shield,
  Smartphone,
  Monitor,
  Globe,
  Trash2,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

const sessions = [
  {
    id: "sess-1",
    device: "Chrome on macOS",
    ip: "192.168.1.42",
    location: "New York, US",
    lastActive: "Active now",
    current: true,
    icon: Monitor,
  },
  {
    id: "sess-2",
    device: "Safari on iPhone",
    ip: "10.0.0.15",
    location: "New York, US",
    lastActive: "2 hours ago",
    current: false,
    icon: Smartphone,
  },
  {
    id: "sess-3",
    device: "Firefox on Windows",
    ip: "203.0.113.52",
    location: "London, UK",
    lastActive: "3 days ago",
    current: false,
    icon: Globe,
  },
];

export default function SecurityPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Security</h1>
        <p className="text-sm text-surface-700 mt-1">
          Manage your password, two-factor authentication, and sessions
        </p>
      </div>

      {/* Account email display */}
      <div className="p-3 rounded-lg bg-surface-200/50 border border-surface-300">
        <p className="text-sm text-surface-700">
          Signed in as{" "}
          <span className="font-medium text-surface-900">
            {user?.email ?? "..."}
          </span>
        </p>
      </div>

      {/* Change password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-brand-400" />
            <CardTitle>Change Password</CardTitle>
          </div>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-md">
            <Input
              id="currentPassword"
              label="Current Password"
              type="password"
              placeholder="Enter current password"
            />
            <Input
              id="newPassword"
              label="New Password"
              type="password"
              placeholder="Enter new password"
            />
            <Input
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Update Password</Button>
        </CardFooter>
      </Card>

      {/* 2FA */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-brand-400" />
              <CardTitle>Two-Factor Authentication</CardTitle>
            </div>
            <Badge variant="warning">Not Enabled</Badge>
          </div>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-surface-200/50 border border-surface-300">
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-surface-700 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-surface-900">
                  Authenticator App
                </p>
                <p className="text-xs text-surface-700 mt-0.5">
                  Use an app like Google Authenticator or Authy to generate
                  one-time verification codes. Highly recommended for accounts
                  with live trading access.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="gap-2">
            <Shield className="h-4 w-4" />
            Enable 2FA
          </Button>
        </CardFooter>
      </Card>

      {/* Active sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-brand-400" />
              <CardTitle>Active Sessions</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 gap-1.5">
              <Trash2 className="h-3.5 w-3.5" />
              Revoke All Others
            </Button>
          </div>
          <CardDescription>
            Manage devices where you are currently logged in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.map((session) => {
              const Icon = session.icon;
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-200/50 border border-surface-300"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-surface-700" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-surface-900">
                          {session.device}
                        </p>
                        {session.current && (
                          <Badge variant="success" className="text-[10px]">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-surface-700">
                        {session.ip} &middot; {session.location} &middot;{" "}
                        {session.lastActive}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 text-xs">
                      Revoke
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
