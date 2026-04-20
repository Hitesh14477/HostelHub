import { useAuth } from "@/context/AuthContext";
import { useFirestore } from "@/hooks/useFirestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Wrench,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatDate } from "@/lib/utils";

const StatCard = ({ title, value, icon: Icon, description, trend }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">
        {trend && (
          <span className={trend > 0 ? "text-green-500" : "text-red-500"}>
            {trend > 0 ? "+" : ""}
            {trend}%{" "}
          </span>
        )}
        {description}
      </p>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { role, user } = useAuth();
  const { data: complaints } = useFirestore("complaints", [], role);
  const { data: leaves } = useFirestore("leaves", [], role);
  const { data: services } = useFirestore("services", [], role);
  const { data: notices } = useFirestore("notices", [], role);
  const { data: attendance } = useFirestore("attendance", [], role);

  const myComplaints = complaints.filter(
    (item) => item.studentId === user?.id || item.studentName === user?.name,
  );
  const myLeaves = leaves.filter(
    (item) => item.studentName === user?.name || item.studentId === user?.id,
  );
  const myServices = services.filter(
    (item) => item.studentId === user?.id || item.studentName === user?.name,
  );
  const unresolvedComplaints = complaints.filter(
    (item) => item.status !== "Resolved",
  );
  const pendingLeaves = leaves.filter((item) => item.status === "Pending");
  const activeServices = services.filter((item) => item.status !== "Completed");
  const totalStudents = new Set(
    attendance
      .filter((item) => item.studentId || item.studentName)
      .map((item) => item.studentId || item.studentName),
  ).size;

  const complaintChartData = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ].map((day) => ({
    name: day,
    complaints: 0,
  }));
  complaints.forEach((item) => {
    const rawDate = item.date || item.createdAt;
    if (!rawDate) return;
    const parsedDate = new Date(rawDate);
    if (Number.isNaN(parsedDate.getTime())) return;
    const day = parsedDate.toLocaleDateString("en-US", { weekday: "short" });
    const target = complaintChartData.find((d) => d.name === day);
    if (target) target.complaints += 1;
  });

  const renderStudentDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here is what's happening in your hostel room
          {user?.hostelRoom ? ` - Room ${user.hostelRoom}` : ""}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Complaints"
          value={myComplaints.filter((c) => c.status !== "Resolved").length}
          icon={AlertTriangle}
          description="Open issues"
        />
        <StatCard
          title="Leave Requests"
          value={myLeaves.length}
          icon={Clock}
          description="Total requests"
        />
        <StatCard
          title="Room Services"
          value={myServices.filter((s) => s.status !== "Completed").length}
          icon={Wrench}
          description="Active services"
        />
        <StatCard
          title="Notices"
          value={notices.length}
          icon={CheckCircle2}
          description="Published notices"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Notices</CardTitle>
            <CardDescription>Important updates from the warden</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notices.slice(0, 3).map((notice) => (
              <div
                key={notice.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm">{notice.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(notice.date)}
                  </p>
                </div>
                {notice.isPinned && (
                  <span className="px-2 py-1 text-xs font-semibold text-destructive bg-destructive/10 rounded-full">
                    Urgent
                  </span>
                )}
              </div>
            ))}
            {notices.length === 0 && (
              <p className="text-sm text-muted-foreground">No notices yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>My Complaints</CardTitle>
            <CardDescription>Status of your recent requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {myComplaints.slice(0, 3).map((comp) => (
              <div
                key={comp.id}
                className="flex items-center justify-between space-x-4"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-2 h-2 rounded-full ${comp.status === "Resolved" ? "bg-green-500" : "bg-yellow-500"}`}
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {comp.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(comp.date)}
                    </p>
                  </div>
                </div>
                <div className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-muted">
                  {comp.status}
                </div>
              </div>
            ))}
            {myComplaints.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No complaints submitted yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderWardenDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Warden Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of hostel operations and pending requests.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Unresolved Complaints"
          value={unresolvedComplaints.length}
          icon={AlertTriangle}
          description="Needs attention"
        />
        <StatCard
          title="Pending Leaves"
          value={pendingLeaves.length}
          icon={Clock}
          description="Awaiting approval"
        />
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          description="In attendance records"
        />
        <StatCard
          title="Active Services"
          value={activeServices.length}
          icon={Wrench}
          description="Maintenance tasks"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Complaints Overview</CardTitle>
            <CardDescription>
              Number of complaints registered this week
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={complaintChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorComplaints"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <CartesianGrid
                  vertical={false}
                  stroke="hsl(var(--border))"
                  strokeDasharray="3 3"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--card))",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="complaints"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorComplaints)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Action Required</CardTitle>
            <CardDescription>Pending requests needing approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Leave Requests ({pendingLeaves.length})
              </h4>
              {[
                ...pendingLeaves.slice(0, 2).map((req) => ({
                  name: req.studentName || "Student",
                  room: req.room || "-",
                  date:
                    req.startDate && req.endDate
                      ? `${formatDate(req.startDate)} - ${formatDate(req.endDate)}`
                      : req.date
                        ? formatDate(req.date)
                        : "-",
                })),
              ].map((req, i) => (
                <div
                  key={`${req.name}-${i}`}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{req.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {req.room} • {req.date}
                    </p>
                  </div>
                  <button className="text-xs font-medium text-primary hover:underline">
                    Review
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Urgent Complaints (
                {
                  complaints.filter(
                    (c) => c.priority === "High" && c.status !== "Resolved",
                  ).length
                }
                )
              </h4>
              {complaints
                .filter((c) => c.priority === "High" && c.status !== "Resolved")
                .slice(0, 1)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-destructive">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.room || "-"} •{" "}
                        {item.date ? formatDate(item.date) : "-"}
                      </p>
                    </div>
                    <button className="text-xs font-medium text-primary hover:underline">
                      Assign
                    </button>
                  </div>
                ))}
              {complaints.filter(
                (c) => c.priority === "High" && c.status !== "Resolved",
              ).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No urgent complaints.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return role === "warden" ? renderWardenDashboard() : renderStudentDashboard();
};

export default Dashboard;
