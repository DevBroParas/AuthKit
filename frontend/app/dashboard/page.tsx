"use client";

import {
    useEffect,
    useState,
} from "react";

import Link from "next/link";

import {
    Activity,
    AppWindow,
    Plus,
    Users,
    ShieldCheck,
} from "lucide-react";

import {
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
} from "recharts";

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import {
    Badge,
} from "@/components/ui/badge";

import {
    Button,
} from "@/components/ui/button";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { API_URL } from "@/lib/api";

const chartConfig = {
    users: {
        label: "Users",
        color: "hsl(var(--chart-1))",
    },
};

export default function DashboardPage() {

    useEffect(() => {
        const token =
            localStorage.getItem("token");

        if (!token) {
            window.location.replace("/auth/login");
        }
    }, []);

    const [data, setData] =
        useState<any>(null);

    const getToken = () => {
        return localStorage.getItem(
            "token"
        );
    };

    useEffect(() => {

        fetchOverview();

        const interval =
            setInterval(
                fetchOverview,
                10000
            );

        return () =>
            clearInterval(interval);

    }, []);

    const fetchOverview =
        async () => {

            try {

                const response =
                    await fetch(
                        `${API_URL}/dashboard/overview`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${getToken()}`,
                            },
                        }
                    );

                const json =
                    await response.json();

                setData(json);

            } catch (error) {

                console.log(error);

            }
        };

    if (!data) {

        return (
            <div className="flex h-[70vh] items-center justify-center text-muted-foreground">
                Loading dashboard...
            </div>
        );
    }

    const stats = [

        {
            title:
                "Total Apps",

            value:
                data.stats.totalProjects,

            icon:
                AppWindow,
        },

        {
            title:
                "Total Users",

            value:
                data.stats.totalUsers,

            icon:
                Users,
        },

        {
            title:
                "Active Sessions",

            value:
                data.stats.activeSessions,

            icon:
                Activity,
        },

        {
            title:
                "Enabled Providers",

            value:
                data.stats.enabledProviders,

            icon:
                ShieldCheck,
        },
    ];

    return (

        <div className="space-y-8 pb-10">


            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div>

                    <h1 className="text-5xl font-bold tracking-tight">
                        Overview
                    </h1>

                    <p className="mt-3 text-lg text-muted-foreground">
                        Monitor all apps, users, and authentication activity.
                    </p>

                </div>

            </div>


            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

                {stats.map(
                    (stat) => {

                        const Icon =
                            stat.icon;

                        return (

                            <Card
                                key={stat.title}
                                className="border-0 shadow-sm"
                            >

                                <CardContent className="flex items-center justify-between p-6">

                                    <div>

                                        <p className="text-sm text-muted-foreground">
                                            {stat.title}
                                        </p>

                                        <h2 className="mt-2 text-4xl font-bold">
                                            {stat.value}
                                        </h2>

                                    </div>

                                    <div className="rounded-2xl bg-muted p-4">

                                        <Icon className="h-7 w-7" />

                                    </div>

                                </CardContent>

                            </Card>
                        );
                    }
                )}

            </div>


            <Card className="border-0 shadow-sm">

                <CardHeader>

                    <CardTitle>
                        User Activity
                    </CardTitle>

                </CardHeader>

                <CardContent>

                    <ChartContainer
                        config={chartConfig}
                        className="h-[350px] w-full"
                    >

                        <AreaChart
                            data={data.chartData}
                            margin={{
                                left: 12,
                                right: 12,
                            }}
                        >

                            <CartesianGrid
                                vertical={false}
                            />

                            <XAxis
                                dataKey="time"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />

                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent />
                                }
                            />

                            <Area
                                dataKey="users"
                                type="natural"
                                fill="var(--color-users)"
                                fillOpacity={0.25}
                                stroke="var(--color-users)"
                                strokeWidth={3}
                            />

                        </AreaChart>

                    </ChartContainer>

                </CardContent>

            </Card>

            <div className="grid gap-6 xl:grid-cols-2">


                <Card className="border-0 shadow-sm">

                    <CardHeader>

                        <CardTitle>
                            Recent Users
                        </CardTitle>

                    </CardHeader>

                    <CardContent className="space-y-5">

                        {data.recentUsers.map(
                            (user: any) => (

                                <div
                                    key={user.id}
                                    className="flex items-center justify-between"
                                >

                                    <div className="flex items-center gap-4">

                                        <Avatar className="h-11 w-11">

                                            <AvatarImage
                                                src={
                                                    user.avatar
                                                }
                                            />

                                            <AvatarFallback>

                                                {user.name?.[0]}

                                            </AvatarFallback>

                                        </Avatar>

                                        <div>

                                            <p className="font-medium">
                                                {user.name}
                                            </p>

                                            <p className="text-sm text-muted-foreground">
                                                {user.email}
                                            </p>

                                        </div>

                                    </div>

                                    <Badge variant="secondary">

                                        {user.projectName}

                                    </Badge>

                                </div>
                            )
                        )}

                    </CardContent>

                </Card>


                <Card className="border-0 shadow-sm">

                    <CardHeader>

                        <CardTitle>
                            Apps
                        </CardTitle>

                    </CardHeader>

                    <CardContent className="grid gap-4">

                        {data.projects.map(
                            (project: any) => (

                                <div
                                    key={project.id}
                                    className="rounded-2xl border p-5"
                                >

                                    <div className="flex items-center justify-between">

                                        <div>

                                            <h3 className="text-lg font-semibold">
                                                {project.name}
                                            </h3>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {project.id.slice(
                                                    0,
                                                    10
                                                )}
                                            </p>

                                        </div>

                                        <Badge>
                                            Active
                                        </Badge>

                                    </div>

                                </div>
                            )
                        )}

                    </CardContent>

                </Card>

            </div>

        </div>
    );
}