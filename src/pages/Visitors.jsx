import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useFirestore } from "@/hooks/useFirestore";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockVisitors = [
  {
    id: "V-001",
    studentName: "Rohan Gupta",
    visitorName: "Ramesh Gupta",
    relation: "Father",
    purpose: "Meeting",
    date: "Oct 26, 2023",
    timeIn: "10:00 AM",
    timeOut: "12:00 PM",
    status: "Approved",
  },
  {
    id: "V-002",
    studentName: "Vikas Singh",
    visitorName: "Suresh Kumar",
    relation: "Uncle",
    purpose: "Deliver items",
    date: "Oct 26, 2023",
    timeIn: "04:00 PM",
    timeOut: "-",
    status: "Pending",
  },
];

const Visitors = () => {
  const { role, user } = useAuth();
  const {
    data: visitors,
    addDocument,
    updateDocument,
  } = useFirestore("visitors", mockVisitors, role);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    vName: "",
    relation: "",
    date: "",
    purpose: "",
  });
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const handleApply = async () => {
    const nextErrors = {};

    if (!formData.vName.trim()) nextErrors.vName = "Visitor name is required.";
    if (!formData.relation) nextErrors.relation = "Relation is required.";
    if (!formData.date) nextErrors.date = "Visit date is required.";
    if (!formData.purpose.trim()) nextErrors.purpose = "Purpose is required.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    await addDocument({
      studentId: user?.id,
      studentName: user?.name || "Student",
      visitorName: formData.vName.trim(),
      relation: formData.relation,
      purpose: formData.purpose.trim(),
      date: formData.date,
      timeIn: "-",
      timeOut: "-",
      status: "Pending",
    });
    setIsDialogOpen(false);
    setErrors({});
    setFormData({ vName: "", relation: "", date: "", purpose: "" });
  };

  const updateStatus = async (id, newStatus) => {
    const timeIn =
      newStatus === "Approved"
        ? new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-";
    await updateDocument(id, { status: newStatus, timeIn });
  };

  const markExit = async (id) => {
    const timeOut = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    await updateDocument(id, { timeOut });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
          >
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      case "Approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-600 border-green-500/20"
          >
            <CheckCircle className="w-3 h-3 mr-1" /> Approved
          </Badge>
        );
      case "Rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-600 border-red-500/20"
          >
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredVisitors = visitors.filter((visitor) => {
    const searchStr =
      `${visitor.visitorName} ${visitor.studentName || ""}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "All" || visitor.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Visitor Management
          </h1>
          <p className="text-muted-foreground mt-1">
            {role === "warden"
              ? "Approve and track visitor entries."
              : "Request approval for your guests and visitors."}
          </p>
        </div>

        {role === "student" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2">
              <UserPlus className="w-4 h-4" />
              Pre-approve Visitor
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleApply();
                }}
              >
                <DialogHeader>
                  <DialogTitle>Visitor Request</DialogTitle>
                  <DialogDescription>
                    Register your visitor in advance for faster security
                    clearance.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="vName">Visitor Name *</Label>
                    <Input
                      id="vName"
                      placeholder="Full name of visitor"
                      value={formData.vName}
                      onChange={(e) => {
                        setFormData({ ...formData, vName: e.target.value });
                        if (errors.vName)
                          setErrors({ ...errors, vName: undefined });
                      }}
                    />

                    {errors.vName && (
                      <p className="text-sm text-destructive">{errors.vName}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="relation">Relation *</Label>
                      <Select
                        value={formData.relation}
                        onValueChange={(val) => {
                          setFormData({ ...formData, relation: val || "" });
                          if (errors.relation)
                            setErrors({ ...errors, relation: undefined });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Parent">Parent</SelectItem>
                          <SelectItem value="Sibling">Sibling</SelectItem>
                          <SelectItem value="Relative">Relative</SelectItem>
                          <SelectItem value="Friend">Friend</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.relation && (
                        <p className="text-sm text-destructive">
                          {errors.relation}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date of Visit *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => {
                          setFormData({ ...formData, date: e.target.value });
                          if (errors.date)
                            setErrors({ ...errors, date: undefined });
                        }}
                      />

                      {errors.date && (
                        <p className="text-sm text-destructive">
                          {errors.date}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose of Visit *</Label>
                    <Input
                      id="purpose"
                      placeholder="e.g. Bringing medicines, Meeting"
                      value={formData.purpose}
                      onChange={(e) => {
                        setFormData({ ...formData, purpose: e.target.value });
                        if (errors.purpose)
                          setErrors({ ...errors, purpose: undefined });
                      }}
                    />

                    {errors.purpose && (
                      <p className="text-sm text-destructive">
                        {errors.purpose}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Fields marked with * are mandatory.
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Submit Request</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search visitors..."
                className="pl-8 bg-muted/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Select
                value={filterStatus}
                onValueChange={(val) => setFilterStatus(val || "All")}
              >
                <SelectTrigger className="w-[140px]">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Visitor
                  </th>
                  {role === "warden" && (
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Student
                    </th>
                  )}
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Details
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Time In/Out
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  {role === "warden" && (
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredVisitors.map((visitor) => (
                  <tr
                    key={visitor.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle">
                      <div className="font-medium">{visitor.visitorName}</div>
                      <div className="text-xs text-muted-foreground">
                        {visitor.relation}
                      </div>
                    </td>
                    {role === "warden" && (
                      <td className="p-4 align-middle font-medium">
                        {visitor.studentName}
                      </td>
                    )}
                    <td className="p-4 align-middle text-muted-foreground">
                      <div className="text-sm">{visitor.purpose}</div>
                      <div className="text-xs">{formatDate(visitor.date)}</div>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      <div className="text-sm">In: {visitor.timeIn}</div>
                      <div className="text-xs">Out: {visitor.timeOut}</div>
                    </td>
                    <td className="p-4 align-middle">
                      {getStatusBadge(visitor.status)}
                    </td>
                    {role === "warden" && (
                      <td className="p-4 align-middle text-right space-x-2">
                        {visitor.status === "Pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateStatus(visitor.id, "Approved")
                              }
                              className="border-green-500/20 text-green-600 hover:bg-green-500/10"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateStatus(visitor.id, "Rejected")
                              }
                              className="border-red-500/20 text-red-600 hover:bg-red-500/10"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {visitor.status === "Approved" &&
                          visitor.timeOut === "-" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => markExit(visitor.id)}
                            >
                              Mark Exit
                            </Button>
                          )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Visitors;
