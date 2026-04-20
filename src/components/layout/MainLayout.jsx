import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  AlertTriangle,
  CalendarDays,
  Bell,
  Users,
  ClipboardList,
  Wrench,
  LogOut,
  Menu,
  Settings,
  Lock,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MainLayout = () => {
  const { role, logout, user, changePassword, deleteAccount } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const studentLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Complaints", path: "/complaints", icon: AlertTriangle },
    { name: "Leave Requests", path: "/leave", icon: CalendarDays },
    { name: "Notices", path: "/notices", icon: Bell },
    { name: "Visitors", path: "/visitors", icon: Users },
    { name: "Attendance", path: "/attendance", icon: ClipboardList },
    { name: "Room Service", path: "/services", icon: Wrench },
  ];

  const wardenLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Complaints", path: "/complaints", icon: AlertTriangle },
    { name: "Leave Approvals", path: "/leave", icon: CalendarDays },
    { name: "Manage Notices", path: "/notices", icon: Bell },
    { name: "Visitor Requests", path: "/visitors", icon: Users },
    { name: "Attendance", path: "/attendance", icon: ClipboardList },
    { name: "Room Service", path: "/services", icon: Wrench },
  ];

  const links = role === "warden" ? wardenLinks : studentLinks;

  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState("");
  const [settingsError, setSettingsError] = React.useState("");
  const [settingsSuccess, setSettingsSuccess] = React.useState("");
  const [isActionLoading, setIsActionLoading] = React.useState(false);

  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
    await logout();
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setSettingsError("Password must be at least 6 characters.");
      return;
    }
    setSettingsError("");
    setSettingsSuccess("");
    setIsActionLoading(true);
    try {
      await changePassword(newPassword);
      setSettingsSuccess("Password changed successfully.");
      setNewPassword("");
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        setSettingsError(
          "Requires recent authentication. Please log out and log in again before trying.",
        );
      } else {
        setSettingsError(error.message || "Failed to change password.");
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you absolutely sure you want to delete your account? This action cannot be undone.",
      )
    )
      return;
    setSettingsError("");
    setIsActionLoading(true);
    try {
      await deleteAccount();
      setIsSettingsModalOpen(false);
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        setSettingsError(
          "Requires recent authentication. Please log out and log in again before trying.",
        );
      } else {
        setSettingsError(error.message || "Failed to delete account.");
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const renderSidebar = () => (
    <div className="flex h-full flex-col bg-card border-r border-border">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">H</span>
          </div>
          <span className="text-xl font-bold tracking-tight">HostelHub</span>
        </Link>
      </div>

      <div className="flex-1 px-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            location.pathname === link.path ||
            location.pathname.startsWith(`${link.path}/`);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={() => setIsMobileOpen(false)}
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-muted/50 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full justify-start hover:bg-muted/50 mb-2"
          onClick={() => setIsSettingsModalOpen(true)}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => setIsLogoutModalOpen(true)}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 h-full">{renderSidebar()}</aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden h-16 border-b border-border flex items-center justify-between px-4 bg-card">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">
                H
              </span>
            </div>
            <span className="text-xl font-bold tracking-tight">HostelHub</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isMobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsMobileOpen(false)}
            />
            <div className="relative w-72 max-w-[80%] h-full bg-card shadow-xl animate-in slide-in-from-left">
              {renderSidebar()}
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-muted/20">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Shared Dialogs */}
      <Dialog
        open={isSettingsModalOpen}
        onOpenChange={(open) => {
          setIsSettingsModalOpen(open);
          if (!open) {
            setSettingsError("");
            setSettingsSuccess("");
            setNewPassword("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Account Settings</DialogTitle>
            <DialogDescription>
              Manage your account security and preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="newPassword"
                  className="flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Change Password
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="New password (min 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />

                  <Button
                    type="submit"
                    disabled={isActionLoading || !newPassword}
                  >
                    Update
                  </Button>
                </div>
              </div>
            </form>

            <div className="space-y-2 pt-4 border-t">
              <Label className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-4 h-4" /> Danger Zone
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDeleteAccount}
                disabled={isActionLoading}
              >
                Delete Account
              </Button>
            </div>

            {settingsError && (
              <p className="text-sm text-destructive font-medium">
                {settingsError}
              </p>
            )}
            {settingsSuccess && (
              <p className="text-sm text-green-600 font-medium">
                {settingsSuccess}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLogout();
          }}
        >
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Confirm Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MainLayout;
