import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFirestore } from "@/hooks/useFirestore";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { Textarea } from "@/components/ui/textarea";
import { Plus, CheckCircle, Clock, Wrench, Search, Filter } from "lucide-react";

const Services = () => {
  const { role, user } = useAuth();
  const {
    data: services,
    addDocument,
    updateDocument,
  } = useFirestore("services", [], role);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    time: "",
    instructions: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const handleApply = async () => {
    const nextErrors = {};

    if (!formData.type) nextErrors.type = "Service type is required.";
    if (!formData.time) nextErrors.time = "Preferred time slot is required.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      await addDocument({
        studentId: user?.id,
        studentName: user?.name || "Student",
        room: user?.hostelRoom || "A-101",
        serviceType: formData.type
          .replace("-", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        requestedAt: new Date().toISOString(),
        status: "Pending",
        completedAt: "-",
        instructions: formData.instructions,
        preferredTime: formData.time,
      });
      setIsDialogOpen(false);
      setErrors({});
      setFormData({ type: "", time: "", instructions: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    const completedAt =
      newStatus === "completed" ? new Date().toISOString() : "-";
    const displayStatus =
      newStatus === "in-progress"
        ? "In Progress"
        : newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    await updateDocument(id, { status: displayStatus, completedAt });
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
      case "In Progress":
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-600 border-blue-500/20"
          >
            <Wrench className="w-3 h-3 mr-1" /> In Progress
          </Badge>
        );
      case "Completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-600 border-green-500/20"
          >
            <CheckCircle className="w-3 h-3 mr-1" /> Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredServices = services.filter((service) => {
    const searchStr =
      `${service.serviceType} ${service.studentName || ""} ${service.room || ""}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "All" || service.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Room Service</h1>
          <p className="text-muted-foreground mt-1">
            {role === "warden"
              ? "Manage and track facility service requests."
              : "Request cleaning, laundry, and maintenance services."}
          </p>
        </div>

        {role === "student" && (
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setErrors({});
              }
            }}
          >
            <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2">
              <Plus className="w-4 h-4" />
              Request Service
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleApply();
                }}
              >
                <DialogHeader>
                  <DialogTitle>New Service Request</DialogTitle>
                  <DialogDescription>
                    Select the type of service you need for your room.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Service Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(val) => {
                        setFormData({ ...formData, type: val || "" });
                        if (errors.type)
                          setErrors({ ...errors, type: undefined });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cleaning">Room Cleaning</SelectItem>
                        <SelectItem value="laundry">Laundry</SelectItem>
                        <SelectItem value="pest-control">
                          Pest Control
                        </SelectItem>
                        <SelectItem value="maintenance">
                          Room Maintenance
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-sm text-destructive">{errors.type}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferredTime">Preferred Time Slot *</Label>
                    <Select
                      value={formData.time}
                      onValueChange={(val) => {
                        setFormData({ ...formData, time: val || "" });
                        if (errors.time)
                          setErrors({ ...errors, time: undefined });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">
                          Morning (9 AM - 12 PM)
                        </SelectItem>
                        <SelectItem value="afternoon">
                          Afternoon (12 PM - 4 PM)
                        </SelectItem>
                        <SelectItem value="evening">
                          Evening (4 PM - 7 PM)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.time && (
                      <p className="text-sm text-destructive">{errors.time}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructions">
                      Additional Instructions
                    </Label>
                    <Textarea
                      id="instructions"
                      placeholder="Any specific requirements?"
                      rows={3}
                      value={formData.instructions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          instructions: e.target.value,
                        })
                      }
                    />
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
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
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
                placeholder="Search services..."
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
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
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
                    Service Type
                  </th>
                  {role === "warden" && (
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Student & Room
                    </th>
                  )}
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Requested At
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  {role === "warden" && (
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredServices.map((service) => (
                  <tr
                    key={service.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle">{service.serviceType}</td>
                    {role === "warden" && (
                      <td className="p-4 align-middle">
                        <div className="font-medium">{service.studentName}</div>
                        <div className="text-xs text-muted-foreground">
                          {service.room}
                        </div>
                      </td>
                    )}
                    <td className="p-4 align-middle text-muted-foreground">
                      {formatDate(service.requestedAt)}
                    </td>
                    <td className="p-4 align-middle">
                      {getStatusBadge(service.status)}
                    </td>
                    {role === "warden" && (
                      <td className="p-4 align-middle text-right">
                        {service.status !== "Completed" && (
                          <Select
                            defaultValue={service.status
                              .toLowerCase()
                              .replace(" ", "-")}
                            onValueChange={(val) =>
                              updateStatus(service.id, val || "")
                            }
                          >
                            <SelectTrigger className="h-8 w-[130px] ml-auto text-xs">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">
                                In Progress
                              </SelectItem>
                              <SelectItem value="completed">
                                Completed
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        {service.status === "Completed" && (
                          <span className="text-xs text-muted-foreground">
                            Done: {formatDate(service.completedAt)}
                          </span>
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

export default Services;
