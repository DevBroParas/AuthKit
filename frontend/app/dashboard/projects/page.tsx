"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Copy,
    Check,
    MoreVertical,
    Pencil,
    Trash2,
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
    Button,
} from "@/components/ui/button";

import {
    Input,
} from "@/components/ui/input";

import {
    FolderKanban,
    Plus,
    Shield,
    Users,
    KeyRound,
} from "lucide-react";

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import Link from "next/link";

import { API_URL } from "@/lib/api";

type Project = {
    id: string;
    name: string;
    publishableKey: string;
    secretKey: string;
};

export default function ProjectsPage() {

    const [projects, setProjects] =
        useState<Project[]>([]);

    const [name, setName] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [createdProject, setCreatedProject] =
        useState<Project | null>(null);

    const [copied, setCopied] =
        useState<string | null>(null);


    const [editingProject, setEditingProject] =
        useState<Project | null>(null);

    const [editName, setEditName] =
        useState("");


    const fetchProjects = async () => {

        try {

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/projects`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
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

    useEffect(() => {
        fetchProjects();
    }, []);


    const copyToClipboard = async (
        text: string,
        type: string
    ) => {

        await navigator.clipboard.writeText(text);

        setCopied(type);

        setTimeout(() => {
            setCopied(null);
        }, 2000);

    };


    const createProject = async () => {

        if (!name) return;

        try {

            setLoading(true);

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/projects`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        name,
                    }),
                }
            );

            const newProject =
                await response.json();


            setCreatedProject(newProject);

            setProjects((prev) => [
                newProject,
                ...prev,
            ]);

            setName("");

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }




    };

    const updateProject = async () => {

        if (!editingProject) return;

        try {

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/projects/${editingProject.id}`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        name: editName,
                    }),
                }
            );

            const updatedProject =
                await response.json();

            setProjects((prev) =>
                prev.map((project) =>
                    project.id === updatedProject.id
                        ? updatedProject
                        : project
                )
            );

            setEditingProject(null);

        } catch (error) {

            console.log(error);

        }
    };


    const deleteProject = async (
        projectId: string
    ) => {

        try {

            const token =
                localStorage.getItem("token");

            await fetch(
                `${API_URL}/projects/${projectId}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            setProjects((prev) =>
                prev.filter(
                    (project) =>
                        project.id !== projectId
                )
            );

        } catch (error) {

            console.log(error);

        }
    };

    <Dialog
        open={!!editingProject}
        onOpenChange={() =>
            setEditingProject(null)
        }
    >

        <DialogContent>

            <DialogHeader>

                <DialogTitle>
                    Edit Project
                </DialogTitle>

                <DialogDescription>
                    Update your project name.
                </DialogDescription>

            </DialogHeader>

            <div className="space-y-4 pt-4">

                <Input
                    value={editName}
                    onChange={(e) =>
                        setEditName(e.target.value)
                    }
                />

                <Button
                    onClick={updateProject}
                    className="w-full"
                >
                    Save Changes
                </Button>

            </div>

        </DialogContent>

    </Dialog>



    return (
        <>

            <Dialog
                open={!!editingProject}
                onOpenChange={() =>
                    setEditingProject(null)
                }
            >

                <DialogContent>

                    <DialogHeader>

                        <DialogTitle>
                            Edit Project
                        </DialogTitle>

                        <DialogDescription>
                            Update your project name.
                        </DialogDescription>

                    </DialogHeader>

                    <div className="space-y-4 pt-4">

                        <Input
                            value={editName}
                            onChange={(e) =>
                                setEditName(e.target.value)
                            }
                        />

                        <Button
                            onClick={updateProject}
                            className="w-full"
                        >
                            Save Changes
                        </Button>

                    </div>

                </DialogContent>

            </Dialog>

            <Dialog
                open={!!createdProject}
                onOpenChange={() =>
                    setCreatedProject(null)
                }
            >

                <DialogContent className="sm:max-w-xl">

                    <DialogHeader>

                        <DialogTitle className="text-3xl">
                            Project Created
                        </DialogTitle>

                        <DialogDescription className="text-base leading-relaxed pt-2">

                            Your project has been created successfully.

                            Save these keys now because the secret key
                            will only be shown once.

                        </DialogDescription>

                    </DialogHeader>

                    <div className="space-y-6 pt-4">


                        <div className="space-y-2">

                            <p className="text-sm font-medium">
                                Publishable Key
                            </p>

                            <div className="flex items-center gap-3 rounded-2xl border bg-muted/40 px-5 py-4">

                                <div className="flex-1 overflow-hidden">

                                    <p className="font-mono text-sm tracking-wide overflow-hidden whitespace-nowrap">

                                        <span className="font-semibold">
                                            {createdProject?.publishableKey.slice(
                                                0,
                                                6
                                            )}
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
                                        copyToClipboard(
                                            createdProject!
                                                .publishableKey,
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

                            <div className="flex items-center gap-3 rounded-2xl border bg-muted/40 px-5 py-4">

                                <div className="flex-1 overflow-hidden">

                                    <p className="font-mono text-sm tracking-wide overflow-hidden whitespace-nowrap">

                                        <span className="font-semibold">
                                            {createdProject?.secretKey.slice(
                                                0,
                                                6
                                            )}
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
                                        copyToClipboard(
                                            createdProject!.secretKey,
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


                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">

                            <h4 className="font-semibold text-amber-900 mb-2">
                                Important Security Notice
                            </h4>

                            <p className="text-sm leading-relaxed text-amber-800">

                                Keep your secret key private.

                                Never expose it in frontend applications or public repositories.

                                You will later manage all API keys from the dedicated API Keys page.

                            </p>

                        </div>

                    </div>

                </DialogContent>

            </Dialog>


            <div className="space-y-8">


                <div>

                    <h1 className="text-4xl font-bold tracking-tight">
                        Projects
                    </h1>

                    <p className="text-muted-foreground mt-2 text-lg max-w-3xl leading-relaxed">

                        Projects represent applications that use your authentication service.

                        Each project gets isolated users, sessions,
                        API keys, and OAuth authentication flows.

                    </p>

                </div>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


                </div>


                <Card>

                    <CardHeader>

                        <CardTitle className="text-2xl flex items-center gap-3">
                            <FolderKanban className="h-6 w-6" />
                            Create New Project
                        </CardTitle>

                        <CardDescription className="text-base leading-relaxed">

                            Create a new application inside AuthCit.

                            Your project will receive API keys
                            for React and Next.js integrations.

                        </CardDescription>

                    </CardHeader>

                    <CardContent className="space-y-6">

                        <div className="flex gap-4">

                            <Input
                                placeholder="My SaaS App"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                className="h-12 text-base"
                            />

                            <Button
                                onClick={createProject}
                                disabled={loading}
                                className="h-12 px-6 gap-2"
                            >

                                <Plus className="h-4 w-4" />

                                {loading
                                    ? "Creating..."
                                    : "Create Project"}

                            </Button>

                        </div>

                        <Alert>

                            <AlertTitle>
                                Important
                            </AlertTitle>

                            <AlertDescription>

                                Secret keys are shown only once immediately after project creation.

                                Future key management will happen inside the API Keys page.

                            </AlertDescription>

                        </Alert>

                    </CardContent>

                </Card>


                <div className="space-y-4">

                    <div>

                        <h2 className="text-2xl font-semibold">
                            Your Projects
                        </h2>

                        <p className="text-muted-foreground mt-1">
                            Applications currently connected to AuthCit.
                        </p>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                        {projects.map((project) => (

                            <Card
                                key={project.id}
                                className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >

                                <CardHeader>

                                    <div className="flex items-center justify-between">

                                        <div>

                                            <CardTitle>
                                                {project.name}
                                            </CardTitle>

                                            <CardDescription className="mt-1">
                                                Authentication enabled
                                            </CardDescription>

                                        </div>

                                        <div className="flex items-center gap-2">

                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">

                                                <FolderKanban className="h-6 w-6 text-primary" />

                                            </div>

                                            <DropdownMenu>

                                                <DropdownMenuTrigger asChild>

                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                    >

                                                        <MoreVertical className="h-5 w-5" />

                                                    </Button>

                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end">


                                                    <DropdownMenuItem
                                                        onClick={() => {

                                                            setEditingProject(project);

                                                            setEditName(project.name);

                                                        }}
                                                    >

                                                        <Pencil className="mr-2 h-4 w-4" />

                                                        Edit

                                                    </DropdownMenuItem>


                                                    <AlertDialog>

                                                        <AlertDialogTrigger asChild>

                                                            <DropdownMenuItem
                                                                onSelect={(e) =>
                                                                    e.preventDefault()
                                                                }
                                                                className="text-red-500 focus:text-red-500"
                                                            >

                                                                <Trash2 className="mr-2 h-4 w-4" />

                                                                Delete

                                                            </DropdownMenuItem>

                                                        </AlertDialogTrigger>

                                                        <AlertDialogContent>

                                                            <AlertDialogHeader>

                                                                <AlertDialogTitle>
                                                                    Delete Project?
                                                                </AlertDialogTitle>

                                                                <AlertDialogDescription>

                                                                    This action cannot be undone.

                                                                    All users and sessions connected
                                                                    to this project may also be removed later.

                                                                </AlertDialogDescription>

                                                            </AlertDialogHeader>

                                                            <AlertDialogFooter>

                                                                <AlertDialogCancel>
                                                                    Cancel
                                                                </AlertDialogCancel>

                                                                <AlertDialogAction
                                                                    onClick={() =>
                                                                        deleteProject(project.id)
                                                                    }
                                                                    className="bg-red-500 hover:bg-red-600"
                                                                >

                                                                    Delete

                                                                </AlertDialogAction>

                                                            </AlertDialogFooter>

                                                        </AlertDialogContent>

                                                    </AlertDialog>

                                                </DropdownMenuContent>

                                            </DropdownMenu>

                                        </div>

                                    </div>

                                </CardHeader>

                                <CardContent className="space-y-5">

                                    <div className="flex items-center justify-between text-sm">

                                        <span className="text-muted-foreground">
                                            OAuth Providers
                                        </span>

                                        <span className="font-medium">
                                            GitHub
                                        </span>

                                    </div>

                                    <div className="flex items-center justify-between text-sm">

                                        <span className="text-muted-foreground">
                                            SDK Status
                                        </span>

                                        <span className="font-medium text-green-600">
                                            Ready
                                        </span>

                                    </div>

                                    <Link
                                        href={`/dashboard/projects/${project.id}`}
                                    >
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                        >
                                            Open Project
                                        </Button>
                                    </Link>

                                </CardContent>

                            </Card>

                        ))}

                    </div>

                </div>

            </div>
        </>
    );
}
