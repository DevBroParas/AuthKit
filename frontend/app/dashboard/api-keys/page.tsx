"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    Copy,
    Eye,
    EyeOff,
    RefreshCcw,
} from "lucide-react";

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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Badge,
} from "@/components/ui/badge";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { API_URL } from "@/lib/api";

export default function ApiKeysPage() {

    const [projects, setProjects] =
        useState<any[]>([]);

    const [
        visibleSecrets,
        setVisibleSecrets,
    ] = useState<
        Record<string, boolean>
    >({});

    const [
        regenerateOpen,
        setRegenerateOpen,
    ] = useState(false);

    const [
        selectedProject,
        setSelectedProject,
    ] = useState<any>(null);

    const [
        regenerateType,
        setRegenerateType,
    ] = useState<
        "publishable" | "secret"
    >("publishable");

    const getToken = () => {
        return localStorage.getItem(
            "token"
        );
    };

    useEffect(() => {

        fetchProjects();

    }, []);

    const fetchProjects =
        async () => {

            try {

                const response =
                    await fetch(
                        `${API_URL}/projects/keys`,
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

    const copyToClipboard =
        async (value: string) => {

            await navigator.clipboard.writeText(
                value
            );
        };

    const regenerateKey =
        async () => {

            try {

                await fetch(
                    `${API_URL}/projects/${selectedProject.id}/regenerate`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${getToken()}`,
                        },

                        body: JSON.stringify({
                            type:
                                regenerateType,
                        }),
                    }
                );

                fetchProjects();

                setRegenerateOpen(
                    false
                );

            } catch (error) {

                console.log(error);

            }
        };

    return (

        <div className="space-y-8 pb-10">


            <div>

                <h1 className="text-4xl font-bold tracking-tight">
                    API Keys
                </h1>

                <p className="mt-2 text-lg text-muted-foreground">
                    Manage your project API keys securely.
                </p>

            </div>


            <Card className="border-0 shadow-sm">

                <CardHeader>

                    <CardTitle>
                        Project Keys
                    </CardTitle>

                </CardHeader>

                <CardContent>

                    <Table>

                        <TableHeader>

                            <TableRow>

                                <TableHead>
                                    Project
                                </TableHead>

                                <TableHead>
                                    Publishable Key
                                </TableHead>

                                <TableHead>
                                    Secret Key
                                </TableHead>

                                <TableHead className="text-right">
                                    Actions
                                </TableHead>

                            </TableRow>

                        </TableHeader>

                        <TableBody>

                            {projects.map(
                                (project) => {

                                    const visible =
                                        visibleSecrets[
                                        project.id
                                        ];

                                    return (

                                        <TableRow
                                            key={project.id}
                                        >

                                            <TableCell>

                                                <div className="space-y-1">

                                                    <p className="font-medium">
                                                        {project.name}
                                                    </p>

                                                    <Badge variant="secondary">
                                                        {project.id.slice(
                                                            0,
                                                            8
                                                        )}
                                                    </Badge>

                                                </div>

                                            </TableCell>


                                            <TableCell>

                                                <div className="flex items-center gap-2">

                                                    <code className="rounded bg-muted px-3 py-2 text-sm">

                                                        {project.publishableKey}

                                                    </code>

                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            copyToClipboard(
                                                                project.publishableKey
                                                            )
                                                        }
                                                    >

                                                        <Copy className="h-4 w-4" />

                                                    </Button>

                                                </div>

                                            </TableCell>


                                            <TableCell>

                                                <div className="flex items-center gap-2">

                                                    <code className="rounded bg-muted px-3 py-2 text-sm">

                                                        {visible
                                                            ? project.secretKey
                                                            : `${project.secretKey.slice(
                                                                0,
                                                                12
                                                            )}••••••••••••`}

                                                    </code>

                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            setVisibleSecrets(
                                                                (
                                                                    prev
                                                                ) => ({
                                                                    ...prev,
                                                                    [project.id]:
                                                                        !visible,
                                                                })
                                                            )
                                                        }
                                                    >

                                                        {visible ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}

                                                    </Button>

                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            copyToClipboard(
                                                                project.secretKey
                                                            )
                                                        }
                                                    >

                                                        <Copy className="h-4 w-4" />

                                                    </Button>

                                                </div>

                                            </TableCell>


                                            <TableCell className="text-right">

                                                <div className="flex justify-end gap-2">

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-2"
                                                        onClick={() => {

                                                            setSelectedProject(
                                                                project
                                                            );

                                                            setRegenerateType(
                                                                "publishable"
                                                            );

                                                            setRegenerateOpen(
                                                                true
                                                            );
                                                        }}
                                                    >

                                                        <RefreshCcw className="h-4 w-4" />

                                                        Publishable

                                                    </Button>

                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="gap-2"
                                                        onClick={() => {

                                                            setSelectedProject(
                                                                project
                                                            );

                                                            setRegenerateType(
                                                                "secret"
                                                            );

                                                            setRegenerateOpen(
                                                                true
                                                            );
                                                        }}
                                                    >

                                                        <RefreshCcw className="h-4 w-4" />

                                                        Secret

                                                    </Button>

                                                </div>

                                            </TableCell>

                                        </TableRow>
                                    );
                                }
                            )}

                        </TableBody>

                    </Table>

                </CardContent>

            </Card>


            <Dialog
                open={regenerateOpen}
                onOpenChange={
                    setRegenerateOpen
                }
            >

                <DialogContent>

                    <DialogHeader>

                        <DialogTitle>
                            Regenerate Key
                        </DialogTitle>

                        <DialogDescription>

                            Regenerating this{" "}

                            {regenerateType}

                            {" "}key will immediately invalidate the old key.

                        </DialogDescription>

                    </DialogHeader>

                    <DialogFooter>

                        <Button
                            variant="outline"
                            onClick={() =>
                                setRegenerateOpen(
                                    false
                                )
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={
                                regenerateKey
                            }
                        >
                            Regenerate
                        </Button>

                    </DialogFooter>

                </DialogContent>

            </Dialog>

        </div>
    );
}