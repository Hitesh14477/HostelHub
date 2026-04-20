import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFirestore } from "@/hooks/useFirestore";
import { formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pin, Megaphone, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const Notices = () => {
  const { role, user } = useAuth();
  const {
    data: notices,
    addDocument,
    updateDocument,
  } = useFirestore("notices", [], role);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPinned: false,
  });

  const handleApply = async () => {
    if (!formData.title || !formData.description) return;
    await addDocument({
      title: formData.title,
      description: formData.description,
      date: new Date().toISOString(),
      author: user?.name || "Warden",
      isPinned: formData.isPinned,
      isRead: false,
    });
    setIsDialogOpen(false);
    setFormData({ title: "", description: "", isPinned: false });
  };

  const togglePin = async (id, current) => {
    await updateDocument(id, { isPinned: !current });
  };

  const markAsRead = async (id) => {
    await updateDocument(id, { isRead: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notice Board</h1>
          <p className="text-muted-foreground mt-1">
            {role === "warden"
              ? "Publish and manage hostel announcements."
              : "Stay updated with the latest hostel announcements."}
          </p>
        </div>

        {role === "warden" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2">
              <Plus className="w-4 h-4" />
              New Notice
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleApply();
                }}
              >
                <DialogHeader>
                  <DialogTitle>Create Notice</DialogTitle>
                  <DialogDescription>
                    Publish a new announcement to the digital notice board.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Notice Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Water Supply Update"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Announcement Content</Label>
                    <Textarea
                      id="description"
                      placeholder="Write the details here..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="pin">Pin to top</Label>
                      <p className="text-xs text-muted-foreground">
                        This notice will stay at the top of the board.
                      </p>
                    </div>
                    <Switch
                      id="pin"
                      checked={formData.isPinned}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isPinned: checked })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Publish Notice</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4">
        {notices.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No notices published yet.
            </CardContent>
          </Card>
        )}
        {[...notices]
          .sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1))
          .map((notice) => (
            <Card
              key={notice.id}
              className={`overflow-hidden transition-all ${notice.isPinned ? "border-primary/50 shadow-md shadow-primary/5" : ""}`}
            >
              <CardHeader
                className={`${role === "student" && !notice.isRead ? "bg-muted/30" : ""}`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3">
                    <div
                      className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notice.isPinned ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
                    >
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {notice.title}
                        {notice.isPinned && (
                          <Badge variant="default" className="text-[10px] h-5">
                            Pinned
                          </Badge>
                        )}
                        {role === "student" && !notice.isRead && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-5 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
                          >
                            New
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {formatDate(notice.date)} • By {notice.author}
                      </CardDescription>
                    </div>
                  </div>

                  {role === "warden" ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePin(notice.id, notice.isPinned)}
                      className={
                        notice.isPinned
                          ? "text-primary"
                          : "text-muted-foreground"
                      }
                    >
                      <Pin className="w-4 h-4" />
                    </Button>
                  ) : (
                    !notice.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notice.id)}
                        className="text-xs gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Mark read
                      </Button>
                    )
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-sm leading-relaxed text-foreground/90">
                  {notice.description}
                </p>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default Notices;
