"use client";

import {
    ArrowLeft,
    Activity,
    Users,
    Shield,
    Copy,
    Check,
    Globe,
    Settings,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Button,
} from "@/components/ui/button";

import {
    Badge,
} from "@/components/ui/badge";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
} from "recharts";

import {
    useParams,
    useRouter,
} from "next/navigation";

import Link from "next/link";

import {
    useState,
    useEffect,
} from "react";
import { API_URL } from "@/lib/api";

const signupData = [
    {
        name: "Mon",
        signups: 12,
    },
    {
        name: "Tue",
        signups: 18,
    },
    {
        name: "Wed",
        signups: 24,
    },
    {
        name: "Thu",
        signups: 16,
    },
    {
        name: "Fri",
        signups: 38,
    },
    {
        name: "Sat",
        signups: 42,
    },
    {
        name: "Sun",
        signups: 29,
    },
];

export default function ProjectPage() {

    const params =
        useParams();

    const projectId =
        params.projectId as string;

    const router =
        useRouter();

    const [copied, setCopied] =
        useState<string | null>(null);

    const [project, setProject] =
        useState<any>(null);

    const [stats, setStats] =
        useState<any>(null);

    const [recentUsers, setRecentUsers] =
        useState<any[]>([]);

    useEffect(() => {

        const fetchOverview =
            async () => {

                try {

                    const token =
                        localStorage.getItem(
                            "token"
                        );

                    const response =
                        await fetch(
                            `${API_URL}/projects/${projectId}/overview`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`,
                                },
                            }
                        );

                    const data =
                        await response.json();

                    setProject(
                        data.project
                    );

                    setStats(
                        data.stats
                    );

                    setRecentUsers(
                        data.recentUsers
                    );

                } catch (error) {

                    console.log(error);

                }
            };

        fetchOverview();

    }, [projectId]);

    const copyKey = async (
        text: string,
        type: string
    ) => {

        await navigator.clipboard.writeText(text);

        setCopied(type);

        setTimeout(() => {
            setCopied(null);
        }, 2000);
    };

    if (!project || !stats) {

        return (
            <div className="flex items-center justify-center h-[70vh]">
                Loading...
            </div>
        );
    }

    return (
        <div className="space-y-8">


            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-center gap-4">

                    <Button
                        size="icon"
                        variant="outline"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>

                    <div>

                        <div className="flex items-center gap-3">

                            <h1 className="text-4xl font-bold tracking-tight">
                                {project.name}
                            </h1>

                            <Badge className="px-3 py-1 text-xs">
                                Active
                            </Badge>

                        </div>

                        <p className="text-muted-foreground mt-2 text-lg">
                            Authentication infrastructure overview.
                        </p>

                    </div>

                </div>

                <div className="flex items-center gap-3">

                    <Button variant="outline">
                        Docs
                    </Button>

                    <Link
                        href={`/dashboard/projects/${projectId}/settings`}
                    >
                        <Button className="gap-2">
                            <Settings className="h-4 w-4" />
                            Settings
                        </Button>
                    </Link>

                </div>

            </div>


            <Tabs defaultValue="7d">

                <TabsList>

                    <TabsTrigger value="24h">
                        24H
                    </TabsTrigger>

                    <TabsTrigger value="7d">
                        7D
                    </TabsTrigger>

                    <TabsTrigger value="30d">
                        30D
                    </TabsTrigger>

                </TabsList>

            </Tabs>


            <div className="grid grid-cols-12 gap-6">


                <Card className="col-span-12 md:col-span-6 xl:col-span-3 border-0 shadow-sm">

                    <CardHeader className="flex flex-row items-start justify-between pb-2">

                        <div>

                            <CardDescription>
                                Total Users
                            </CardDescription>

                            <CardTitle className="text-4xl mt-3">
                                {stats.totalUsers}
                            </CardTitle>

                        </div>

                        <div className="w-14 h-14 bg-primary/10 flex items-center justify-center">
                            <Users className="h-7 w-7 text-primary" />
                        </div>

                    </CardHeader>

                    <CardContent>

                        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">

                            <Activity className="h-4 w-4" />

                            Live project users

                        </div>

                    </CardContent>

                </Card>


                <Card className="col-span-12 md:col-span-6 xl:col-span-3 border-0 shadow-sm">

                    <CardHeader className="flex flex-row items-start justify-between pb-2">

                        <div>

                            <CardDescription>
                                Active Sessions
                            </CardDescription>

                            <CardTitle className="text-4xl mt-3">
                                {stats.activeSessions}
                            </CardTitle>

                        </div>

                        <div className="w-14 h-14 bg-green-500/10 flex items-center justify-center">
                            <Shield className="h-7 w-7 text-green-600" />
                        </div>

                    </CardHeader>

                    <CardContent>

                        <div className="text-sm text-muted-foreground">
                            Live authenticated users
                        </div>

                    </CardContent>

                </Card>


                <Card className="col-span-12 md:col-span-6 xl:col-span-3 border-0 shadow-sm">

                    <CardHeader className="flex flex-row items-start justify-between pb-2">

                        <div className="overflow-hidden">

                            <CardDescription>
                                Project ID
                            </CardDescription>

                            <CardTitle className="text-lg mt-3 truncate font-mono">
                                {project.id}
                            </CardTitle>

                        </div>

                        <Button
                            size="icon"
                            variant="outline"
                            onClick={() =>
                                copyKey(
                                    project.id,
                                    "id"
                                )
                            }
                        >

                            {copied === "id" ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}

                        </Button>

                    </CardHeader>

                    <CardContent>

                        <div className="text-sm text-muted-foreground">

                            Created {
                                new Date(
                                    project.createdAt
                                ).toLocaleDateString()
                            }

                        </div>

                    </CardContent>

                </Card>


                <Card className="col-span-12 md:col-span-6 xl:col-span-3 border-0 shadow-sm">

                    <CardHeader>

                        <CardDescription>
                            OAuth Providers
                        </CardDescription>

                        <div className="flex items-center gap-3 mt-4">

                            <div className="w-12 h-12 border flex items-center justify-center bg-muted/40">
                                <img
                                    src="/github-50.png"
                                    className="h-6 w-6"
                                />
                            </div>

                            <div className="w-12 h-12 border flex items-center justify-center bg-muted/40">
                                <img
                                    src="/google-48.png"
                                    className="h-6 w-6"
                                />
                            </div>

                        </div>

                    </CardHeader>

                    <CardContent>

                        <p className="text-sm text-muted-foreground">

                            {stats.providersEnabled}
                            {" "}providers enabled

                        </p>

                    </CardContent>

                </Card>


                <Card className="col-span-12 xl:col-span-8 border-0 shadow-sm overflow-hidden">

                    <CardHeader>

                        <div className="flex items-center justify-between">

                            <div>

                                <CardTitle className="text-2xl">
                                    Live User Signups
                                </CardTitle>

                                <CardDescription className="mt-2 text-base">
                                    Updated every 30 seconds.
                                </CardDescription>

                            </div>

                            <Badge className="px-3 py-1">
                                Live
                            </Badge>

                        </div>

                    </CardHeader>

                    <CardContent className="h-[350px] pt-4">

                        <ResponsiveContainer width="100%" height="100%">

                            <AreaChart data={signupData}>

                                <defs>

                                    <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="currentColor" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
                                    </linearGradient>

                                </defs>

                                <CartesianGrid vertical={false} strokeDasharray="3 3" />

                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                />

                                <Tooltip />

                                <Area
                                    type="monotone"
                                    dataKey="signups"
                                    stroke="currentColor"
                                    fill="url(#fillUsers)"
                                    strokeWidth={3}
                                />

                            </AreaChart>

                        </ResponsiveContainer>

                    </CardContent>

                </Card>


                <Card className="col-span-12 xl:col-span-4 border-0 shadow-sm">

                    <CardHeader>

                        <CardTitle className="text-2xl">
                            Recent Signups
                        </CardTitle>

                        <CardDescription className="mt-2 text-base">
                            Latest authenticated users.
                        </CardDescription>

                    </CardHeader>

                    <CardContent className="space-y-5">

                        {recentUsers.map((user) => (

                            <div
                                key={user.id}
                                className="flex items-center justify-between"
                            >

                                <div className="flex items-center gap-3 overflow-hidden">

                                    <Avatar className="h-12 w-12">

                                        <AvatarImage src={user.avatar} />

                                        <AvatarFallback>
                                            {user.name?.[0]}
                                        </AvatarFallback>

                                    </Avatar>

                                    <div className="overflow-hidden">

                                        <p className="font-medium truncate">
                                            {user.name}
                                        </p>

                                        <p className="text-sm text-muted-foreground truncate">
                                            {user.email}
                                        </p>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </CardContent>

                </Card>


                <Card className="col-span-12 xl:col-span-7 border-0 shadow-sm">

                    <CardHeader>

                        <CardTitle className="text-2xl">
                            API Keys
                        </CardTitle>

                        <CardDescription className="mt-2 text-base">
                            Secure credentials for SDK integrations.
                        </CardDescription>

                    </CardHeader>

                    <CardContent className="space-y-6">


                        <div className="space-y-2">

                            <p className="text-sm font-medium">
                                Publishable Key
                            </p>

                            <div className="flex items-center gap-3 border bg-muted/40 px-5 py-4">

                                <div className="flex-1 overflow-hidden">

                                    <p className="font-mono text-sm tracking-wide overflow-hidden whitespace-nowrap">

                                        <span className="font-semibold">
                                            {project.publishableKey.slice(0, 10)}
                                        </span>

                                        <span className="opacity-40">
                                            ****************************************
                                        </span>

                                    </p>

                                </div>

                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() =>
                                        copyKey(
                                            project.publishableKey,
                                            "pk"
                                        )
                                    }
                                >

                                    {copied === "pk" ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}

                                </Button>

                            </div>

                        </div>


                        <div className="space-y-2">

                            <p className="text-sm font-medium">
                                Secret Key
                            </p>

                            <div className="flex items-center gap-3 border bg-muted/40 px-5 py-4">

                                <div className="flex-1 overflow-hidden">

                                    <p className="font-mono text-sm tracking-wide overflow-hidden whitespace-nowrap">

                                        <span className="font-semibold">
                                            {project.secretKey.slice(0, 10)}
                                        </span>

                                        <span className="opacity-40">
                                            ****************************************
                                        </span>

                                    </p>

                                </div>

                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() =>
                                        copyKey(
                                            project.secretKey,
                                            "sk"
                                        )
                                    }
                                >

                                    {copied === "sk" ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}

                                </Button>

                            </div>

                        </div>

                    </CardContent>

                </Card>


                <Card className="col-span-12 xl:col-span-5 border-0 shadow-sm">

                    <CardHeader>

                        <CardTitle className="text-2xl">
                            SDK Setup
                        </CardTitle>

                        <CardDescription className="mt-2 text-base">
                            Connect your React or Next.js application.
                        </CardDescription>

                    </CardHeader>

                    <CardContent className="space-y-5">

                        <div className="bg-black text-white p-5 overflow-auto">

                            <p className="font-mono text-sm">
                                npm install @authkit/react
                            </p>

                        </div>

                        <div className="bg-muted/40 border p-5 overflow-auto">

                            <pre className="text-sm overflow-auto">
                                {`<AuthKitProvider
  publishableKey="${project.publishableKey}"
>
  <App />
</AuthKitProvider>`}
                            </pre>

                        </div>

                    </CardContent>

                </Card>

            </div>

        </div>
    );
}