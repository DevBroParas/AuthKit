"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    Search,
    Shield,
    ShieldOff,
} from "lucide-react";

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

import {
    Input,
} from "@/components/ui/input";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { API_URL } from "@/lib/api";

export default function UsersPage() {

    const [users, setUsers] =
        useState<any[]>([]);

    const [projects, setProjects] =
        useState<any[]>([]);

    const [search, setSearch] =
        useState("");

    const [selectedProject, setSelectedProject] =
        useState("all");

    const getToken = () => {
        return localStorage.getItem(
            "token"
        );
    };

    useEffect(() => {

        fetchUsers();

        fetchProjects();

    }, [selectedProject, search]);

    const fetchProjects =
        async () => {

            try {

                const response =
                    await fetch(
                        `${API_URL}/projects`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${getToken()}`,
                            },
                        }
                    );

                const data =
                    await response.json();

                setProjects(data);

            } catch (error) {

                console.log(error);

            }
        };

    const fetchUsers =
        async () => {

            try {

                const query =
                    new URLSearchParams();

                if (
                    selectedProject !== "all"
                ) {
                    query.append(
                        "projectId",
                        selectedProject
                    );
                }

                if (search) {
                    query.append(
                        "search",
                        search
                    );
                }

                const response =
                    await fetch(
                        `${API_URL}/users?${query.toString()}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${getToken()}`,
                            },
                        }
                    );

                const data =
                    await response.json();

                setUsers(data);

            } catch (error) {

                console.log(error);

            }
        };

    const toggleBlock =
        async (
            userId: string,
            projectId: string,
            blocked: boolean
        ) => {

            try {

                await fetch(
                    `${API_URL}/users/${userId}/projects/${projectId}`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${getToken()}`,
                        },

                        body: JSON.stringify({
                            blocked:
                                !blocked,
                        }),
                    }
                );

                fetchUsers();

            } catch (error) {

                console.log(error);

            }
        };

    return (

        <div className="space-y-8 pb-10">


            <div>

                <h1 className="text-4xl font-bold tracking-tight">
                    Users
                </h1>

                <p className="text-muted-foreground mt-2 text-lg">
                    Manage all users across your apps.
                </p>

            </div>


            <Card className="border-0 shadow-sm">

                <CardHeader>

                    <CardTitle>
                        Filters
                    </CardTitle>

                </CardHeader>

                <CardContent className="flex flex-col gap-4 lg:flex-row">

                    <div className="relative flex-1">

                        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

                        <Input
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            className="pl-10 h-12"
                        />

                    </div>

                    <Select
                        value={selectedProject}
                        onValueChange={
                            setSelectedProject
                        }
                    >

                        <SelectTrigger className="h-12 w-full lg:w-[260px]">

                            <SelectValue placeholder="All Apps" />

                        </SelectTrigger>

                        <SelectContent>

                            <SelectItem value="all">
                                All Apps
                            </SelectItem>

                            {projects.map(
                                (project) => (

                                    <SelectItem
                                        key={project.id}
                                        value={project.id}
                                    >
                                        {project.name}
                                    </SelectItem>
                                )
                            )}

                        </SelectContent>

                    </Select>

                </CardContent>

            </Card>


            <Card className="border-0 shadow-sm">

                <CardHeader>

                    <CardTitle>
                        Users
                    </CardTitle>

                </CardHeader>

                <CardContent>

                    <Table>

                        <TableHeader>

                            <TableRow>

                                <TableHead>
                                    User
                                </TableHead>

                                <TableHead>
                                    Email
                                </TableHead>

                                <TableHead>
                                    Provider
                                </TableHead>

                                <TableHead>
                                    App
                                </TableHead>

                                <TableHead>
                                    Status
                                </TableHead>

                                <TableHead className="text-right">
                                    Action
                                </TableHead>

                            </TableRow>

                        </TableHeader>

                        <TableBody>

                            {users.map((user) => (

                                <TableRow
                                    key={user.id}
                                >

                                    <TableCell>

                                        <div className="flex items-center gap-3">

                                            <Avatar>

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
                                                    {user.id.slice(0, 8)}
                                                </p>

                                            </div>

                                        </div>

                                    </TableCell>

                                    <TableCell>
                                        {user.email}
                                    </TableCell>

                                    <TableCell>

                                        <Badge variant="secondary">
                                            {user.provider}
                                        </Badge>

                                    </TableCell>

                                    <TableCell>
                                        {user.projectName}
                                    </TableCell>

                                    <TableCell>

                                        {user.blocked ? (

                                            <Badge variant="destructive">
                                                Blocked
                                            </Badge>

                                        ) : (

                                            <Badge>
                                                Active
                                            </Badge>

                                        )}

                                    </TableCell>

                                    <TableCell className="text-right">

                                        <Button
                                            variant={
                                                user.blocked
                                                    ? "default"
                                                    : "destructive"
                                            }
                                            size="sm"
                                            className="gap-2"
                                            onClick={() =>
                                                toggleBlock(
                                                    user.id,
                                                    user.projectId,
                                                    user.blocked
                                                )
                                            }
                                        >

                                            {user.blocked ? (
                                                <Shield className="h-4 w-4" />
                                            ) : (
                                                <ShieldOff className="h-4 w-4" />
                                            )}

                                            {user.blocked
                                                ? "Unblock"
                                                : "Block"}

                                        </Button>

                                    </TableCell>

                                </TableRow>

                            ))}

                        </TableBody>

                    </Table>

                </CardContent>

            </Card>

        </div>
    );
}