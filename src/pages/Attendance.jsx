import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useFirestore } from "@/hooks/useFirestore";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX, Clock, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useMemo, useState } from "react";
import { formatDate } from "@/lib/utils";

const Attendance = () => {
  const { role, user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const {
    data: attendance,
    updateDocument,
    addDocument,
  } = useFirestore("attendance", [], role);
  const { data: users } = useFirestore("users", []);
  const myLogs = attendance.filter(
    (record) =>
      record.studentId === user?.id || record.studentName === user?.name,
  );
  const students = useMemo(
    () => users.filter((u) => u.role === "student"),
    [users],
  );

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const searchStr =
        `${student.fullName || student.name || student.email} ${student.hostelRoomNumber || student.hostelRoom || ""}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
      const record = attendance.find(
        (item) =>
          item.studentId === (student.userUid || student.id) &&
          item.date === selectedDate,
      );
      const status = record?.status || "Absent";
      const matchesFilter = filterStatus === "All" || status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [students, attendance, selectedDate, searchQuery, filterStatus]);

  const updateAttendance = async (id, newStatus) => {
    const time =
      newStatus !== "Absent"
        ? new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-";
    await updateDocument(id, { status: newStatus, time });
  };

  const upsertAttendance = async (student, newStatus) => {
    const existing = attendance.find(
      (record) =>
        record.studentId === (student.userUid || student.id) &&
        record.date === selectedDate,
    );
    const time =
      newStatus !== "Absent"
        ? new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-";

    if (existing) {
      await updateAttendance(existing.id, newStatus);
      return;
    }

    await addDocument({
      studentId: student.userUid || student.id,
      studentName: student.fullName || student.name || student.email,
      room: student.hostelRoomNumber || student.hostelRoom || "-",
      date: selectedDate,
      status: newStatus,
      time,
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Present":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-600 border-green-500/20"
          >
            <UserCheck className="w-3 h-3 mr-1" /> Present
          </Badge>
        );
      case "Absent":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-600 border-red-500/20"
          >
            <UserX className="w-3 h-3 mr-1" /> Absent
          </Badge>
        );
      case "Late":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
          >
            <Clock className="w-3 h-3 mr-1" /> Late
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderStudentView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">
              {myLogs.length
                ? `${Math.round((myLogs.filter((l) => l.status === "Present").length / myLogs.length) * 100)}%`
                : "0%"}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Overall Attendance
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-red-500">
              {myLogs.filter((l) => l.status === "Absent").length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Leaves/Absences
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-500">
              {myLogs.filter((l) => l.status === "Late").length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Late Entries
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Attendance Logs</CardTitle>
          <CardDescription>Recent night attendance records</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors bg-muted/50">
                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                  Date
                </th>
                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                  Status
                </th>
                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                  Recorded Time
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {myLogs.length === 0 && (
                <tr>
                  <td
                    className="p-6 text-center text-muted-foreground"
                    colSpan={3}
                  >
                    No attendance records yet.
                  </td>
                </tr>
              )}
              {[...myLogs]
                .filter(
                  (log) =>
                    filterStatus === "All" || log.status === filterStatus,
                )
                .sort((a, b) => String(b.date).localeCompare(String(a.date)))
                .map((log) => (
                  <tr
                    key={log.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-6 align-middle font-medium">
                      {formatDate(log.date)}
                    </td>
                    <td className="p-6 align-middle">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="p-6 align-middle text-muted-foreground">
                      {log.time}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );

  const renderWardenView = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-4 w-full md:w-auto flex-1">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by student name or room..."
              className="pl-8 bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
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
              <SelectItem value="Present">Present</SelectItem>
              <SelectItem value="Absent">Absent</SelectItem>
              <SelectItem value="Late">Late</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Night Attendance Verification</CardTitle>
          <CardDescription>
            Verify student presence for the selected date.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors bg-muted/50">
                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                  Student Info
                </th>
                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                  Room
                </th>
                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                  Status
                </th>
                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {students.length === 0 && (
                <tr>
                  <td
                    className="p-6 text-center text-muted-foreground"
                    colSpan={4}
                  >
                    No students found.
                  </td>
                </tr>
              )}
              {filteredStudents.map((student) => {
                const record = attendance.find(
                  (item) =>
                    item.studentId === (student.userUid || student.id) &&
                    item.date === selectedDate,
                );
                const status = record?.status || "Absent";
                const time = record?.time || "-";
                return (
                  <tr
                    key={student.userUid || student.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-6 align-middle">
                      <div className="font-medium">
                        {student.fullName || student.name || student.email}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {student.userUid || student.id}
                      </div>
                    </td>
                    <td className="p-6 align-middle">
                      {student.hostelRoomNumber || student.hostelRoom || "-"}
                    </td>
                    <td className="p-6 align-middle">
                      <select
                        className="text-sm border rounded p-1 bg-background"
                        value={status}
                        onChange={(e) =>
                          upsertAttendance(student, e.target.value)
                        }
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                      </select>
                    </td>
                    <td className="p-6 align-middle text-muted-foreground">
                      {time}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground mt-1">
          {role === "warden"
            ? "Monitor and verify night attendance."
            : "Track your hostel attendance records."}
        </p>
      </div>
      {role === "warden" ? renderWardenView() : renderStudentView()}
    </div>
  );
};

export default Attendance;
