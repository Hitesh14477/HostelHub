import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFirestore } from "@/hooks/useFirestore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

import { Plus, CheckCircle, XCircle, Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const Leave = () => {
  const { role, user } = useAuth();
  const {
    data: leaves,
    addDocument,
    updateDocument,
  } = useFirestore("leaves", [], role);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    destination: "",
    reason: "",
    parentContact: "",
  });
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const handleApply = async () => {
    const nextErrors = {};

    if (!formData.startDate) nextErrors.startDate = "Start date is required.";
    if (!formData.endDate) nextErrors.endDate = "End date is required.";
    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      nextErrors.endDate = "End date cannot be earlier than start date.";
    }
    if (!formData.destination.trim())
      nextErrors.destination = "Destination is required.";
    if (!formData.reason.trim()) nextErrors.reason = "Reason is required.";
    if (!formData.parentContact.trim()) {
      nextErrors.parentContact = "Parent contact number is required.";
    } else if (!/^[0-9+\-\s()]{8,15}$/.test(formData.parentContact.trim())) {
      nextErrors.parentContact = "Enter a valid contact number.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const newLeave = {
      studentName: user?.name || "Student",
      room: user?.hostelRoom || "A-101",
      startDate: formData.startDate,
      endDate: formData.endDate,
      destination: formData.destination.trim(),
      status: "Pending",
      reason: formData.reason.trim(),
      parentContact: formData.parentContact.trim(),
    };
    await addDocument(newLeave);
    setIsDialogOpen(false);
    setErrors({});
    setFormData({
      startDate: "",
      endDate: "",
      destination: "",
      reason: "",
      parentContact: "",
    });
  };

  const updateStatus = async (id, newStatus) => {
    await updateDocument(id, { status: newStatus });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
          >
            Pending
          </Badge>
        );
      case "Approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-600 border-green-500/20"
          >
            Approved
          </Badge>
        );
      case "Rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-600 border-red-500/20"
          >
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    const searchTarget =
      role === "warden" ? leave.studentName : leave.destination;
    const matchesSearch =
      searchTarget &&
      searchTarget.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "All" || leave.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Requests</h1>
          <p className="text-muted-foreground mt-1">
            {role === "warden"
              ? "Manage and approve student leave requests."
              : "Apply for hostel leaves and track approvals."}
          </p>
        </div>

        {role === "student" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2">
              <Plus className="w-4 h-4" />
              Apply for Leave
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleApply();
                }}
              >
                <DialogHeader>
                  <DialogTitle>Leave Application</DialogTitle>
                  <DialogDescription>
                    Submit your leave details for warden's approval.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            startDate: e.target.value,
                          });
                          if (errors.startDate)
                            setErrors({ ...errors, startDate: undefined });
                        }}
                      />

                      {errors.startDate && (
                        <p className="text-sm text-destructive">
                          {errors.startDate}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => {
                          setFormData({ ...formData, endDate: e.target.value });
                          if (errors.endDate)
                            setErrors({ ...errors, endDate: undefined });
                        }}
                      />

                      {errors.endDate && (
                        <p className="text-sm text-destructive">
                          {errors.endDate}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination *</Label>
                    <Input
                      id="destination"
                      placeholder="e.g. Home, Local Guardian"
                      value={formData.destination}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          destination: e.target.value,
                        });
                        if (errors.destination)
                          setErrors({ ...errors, destination: undefined });
                      }}
                    />

                    {errors.destination && (
                      <p className="text-sm text-destructive">
                        {errors.destination}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Leave *</Label>
                    <Textarea
                      id="reason"
                      placeholder="Briefly describe the reason..."
                      rows={3}
                      value={formData.reason}
                      onChange={(e) => {
                        setFormData({ ...formData, reason: e.target.value });
                        if (errors.reason)
                          setErrors({ ...errors, reason: undefined });
                      }}
                    />

                    {errors.reason && (
                      <p className="text-sm text-destructive">
                        {errors.reason}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parentContact">
                        Parent Contact No. *
                      </Label>
                      <Input
                        id="parentContact"
                        type="tel"
                        placeholder="+91"
                        value={formData.parentContact}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            parentContact: e.target.value,
                          });
                          if (errors.parentContact)
                            setErrors({ ...errors, parentContact: undefined });
                        }}
                      />

                      {errors.parentContact && (
                        <p className="text-sm text-destructive">
                          {errors.parentContact}
                        </p>
                      )}
                    </div>
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

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={
              role === "warden" ? "Search students..." : "Search destination..."
            }
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

      <div className="grid gap-4">
        {filteredLeaves.map((leave) => (
          <Card key={leave.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="p-6 md:w-2/3 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {role === "warden"
                        ? leave.studentName
                        : leave.destination}
                      {getStatusBadge(leave.status)}
                    </h3>
                    {role === "warden" && (
                      <p className="text-sm text-muted-foreground">
                        Room: {leave.room}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(leave.startDate)} -{" "}
                      {formatDate(leave.endDate)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Reason:</p>
                  <p className="text-sm text-muted-foreground">
                    {leave.reason}
                  </p>
                </div>
              </div>

              <div className="bg-muted/30 p-6 md:w-1/3 border-t md:border-t-0 md:border-l flex flex-col justify-center items-center gap-3">
                {role === "warden" && leave.status === "Pending" ? (
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      onClick={() => updateStatus(leave.id, "Approved")}
                      className="flex-1 bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-700 border-green-500/20"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateStatus(leave.id, "Rejected")}
                      className="flex-1 bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700 border-red-500/20"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    {getStatusBadge(leave.status)}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Leave;
