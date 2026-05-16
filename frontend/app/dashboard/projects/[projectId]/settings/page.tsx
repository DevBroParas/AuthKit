"use client";

import Link from "next/link";

import {
    ArrowLeft,
    Copy,
    Check,
    Globe,
    KeyRound,
    Trash2,
    Shield,
    Plus,
    Save,
} from "lucide-react";

import {
    useState,
    useEffect,
} from "react";

import {
    useParams,
    useRouter,
} from "next/navigation";

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
    Input,
} from "@/components/ui/input";

import {
    Label,
} from "@/components/ui/label";

import {
    Switch,
} from "@/components/ui/switch";

import {
    Separator,
} from "@/components/ui/separator";

import {
    Badge,
} from "@/components/ui/badge";

import {API_URL} from "@/lib/api";

export default function ProjectSettingsPage() {

    const params =
        useParams();

    const projectId =
        params.projectId as string;

    const router =
        useRouter();

    const [project, setProject] =
        useState<any>(null);

    const [projectName, setProjectName] =
        useState("");

    const [domainInput, setDomainInput] =
        useState("");

    const [domains, setDomains] =
        useState<any[]>([]);

    const [providers, setProviders] =
        useState<any[]>([]);

    const [copied, setCopied] =
        useState<string | null>(null);

    useEffect(() => {

        fetchProject();

        fetchProviders();

        fetchDomains();

    }, []);

    const getToken = () => {

        return localStorage.getItem(
            "token"
        );
    };

    const fetchProject =
        async () => {

            try {

                const response =
                    await fetch(
                        `${API_URL}/projects/${projectId}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${getToken()}`,
                            },
                        }
                    );

                const data =
                    await response.json();

                setProject(data);

                setProjectName(
                    data.name
                );

            } catch (error) {

                console.log(error);

            }
        };

    const fetchProviders =
        async () => {

            try {

                const response =
                    await fetch(
                        `${API_URL}/projects/${projectId}/providers`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${getToken()}`,
                            },
                        }
                    );

                const data =
                    await response.json();

                setProviders(data);

            } catch (error) {

                console.log(error);

            }
        };

    const fetchDomains =
        async () => {

            try {

                const response =
                    await fetch(
                        `${API_URL}/projects/${projectId}/domains`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${getToken()}`,
                            },
                        }
                    );

                const data =
                    await response.json();

                setDomains(data);

            } catch (error) {

                console.log(error);

            }
        };

    const saveProject =
        async () => {

            try {

                await fetch(
                    `${API_URL}/projects/${projectId}`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${getToken()}`,
                        },

                        body: JSON.stringify({
                            name: projectName,
                        }),
                    }
                );

                fetchProject();

            } catch (error) {

                console.log(error);

            }
        };

    const toggleProvider =
        async (
            provider: string,
            enabled: boolean
        ) => {

            try {

                await fetch(
                    `${API_URL}/projects/${projectId}/providers/${provider}`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${getToken()}`,
                        },

                        body: JSON.stringify({
                            enabled,
                        }),
                    }
                );

                fetchProviders();

            } catch (error) {

                console.log(error);

            }
        };

    const addDomain =
        async () => {

            if (!domainInput.trim()) {
                return;
            }

            try {

                await fetch(
                    `${API_URL}/projects/${projectId}/domains`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${getToken()}`,
                        },

                        body: JSON.stringify({
                            domain:
                                domainInput,
                        }),
                    }
                );

                setDomainInput("");

                fetchDomains();

            } catch (error) {

                console.log(error);

            }
        };

    const removeDomain =
        async (
            domainId: string
        ) => {

            try {

                await fetch(
                    `${API_URL}/projects/${projectId}/domains/${domainId}`,
                    {
                        method: "DELETE",

                        headers: {
                            Authorization:
                                `Bearer ${getToken()}`,
                        },
                    }
                );

                fetchDomains();

            } catch (error) {

                console.log(error);

            }
        };

    const deleteProject =
        async () => {

            try {

                await fetch(
                    `${API_URL}/projects/${projectId}`,
                    {
                        method: "DELETE",

                        headers: {
                            Authorization:
                                `Bearer ${getToken()}`,
                        },
                    }
                );

                router.push(
                    "/dashboard/projects"
                );

            } catch (error) {

                console.log(error);

            }
        };

    const copyKey = async (
        key: string,
        type: string
    ) => {

        await navigator.clipboard.writeText(
            key
        );

        setCopied(type);

        setTimeout(() => {
            setCopied(null);
        }, 2000);
    };

    if (!project) {

        return (
            <div className="flex items-center justify-center h-[70vh]">
                Loading...
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">

            {/* HEADER */}

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-center gap-4">

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>

                    <div>

                        <div className="flex items-center gap-3">

                            <h1 className="text-4xl font-bold tracking-tight">
                                Project Settings
                            </h1>

                            <Badge>
                                Active
                            </Badge>

                        </div>

                        <p className="text-muted-foreground mt-2 text-lg">
                            Configure providers, domains, keys and security.
                        </p>

                    </div>

                </div>

                <Link
                    href={`/dashboard/projects/${projectId}`}
                >
                    <Button>
                        Back To Overview
                    </Button>
                </Link>

            </div>

            {/* GENERAL */}

            <Card className="border-0 shadow-sm">

                <CardHeader>

                    <CardTitle className="text-2xl">
                        General
                    </CardTitle>

                    <CardDescription className="text-base mt-2">
                        Update your project configuration.
                    </CardDescription>

                </CardHeader>

                <CardContent className="space-y-6">

                    <div className="space-y-3">

                        <Label>
                            Project Name
                        </Label>

                        <Input
                            value={projectName}
                            onChange={(e) =>
                                setProjectName(
                                    e.target.value
                                )
                            }
                            className="h-12"
                        />

                    </div>

                    <div className="flex justify-end">

                        <Button
                            className="gap-2"
                            onClick={saveProject}
                        >
                            <Save className="h-4 w-4" />
                            Save Changes
                        </Button>

                    </div>

                </CardContent>

            </Card>

            {/* PROVIDERS */}

            <Card className="border-0 shadow-sm">

                <CardHeader>

                    <CardTitle className="text-2xl">
                        OAuth Providers
                    </CardTitle>

                    <CardDescription className="text-base mt-2">
                        Enable or disable authentication providers.
                    </CardDescription>

                </CardHeader>

                <CardContent className="space-y-5">

                    {[
                        "github",
                        "google",
                        "discord",
                    ].map((provider) => {

                        const current =
                            providers.find(
                                (p) =>
                                    p.provider ===
                                    provider
                            );

                        return (

                            <div
                                key={provider}
                                className="flex items-center justify-between rounded-2xl border p-5 bg-muted/20"
                            >

                                <div className="flex items-center gap-4">

                                    <div className="w-14 h-14 rounded-2xl border bg-background flex items-center justify-center">

                                        {provider === "github" && (
                                            <img
                                                src="/github-50.png"
                                                className="h-7 w-7"
                                            />
                                        )}

                                        {provider === "google" && (
                                            <img
                                                src="/google-48.png"
                                                className="h-7 w-7"
                                            />
                                        )}

                                        {provider === "discord" && (
                                            <Shield className="h-7 w-7 text-primary" />
                                        )}

                                    </div>

                                    <div>

                                        <p className="font-semibold text-lg capitalize">
                                            {provider}
                                        </p>

                                        <p className="text-sm text-muted-foreground mt-1">
                                            Enable {provider} authentication.
                                        </p>

                                    </div>

                                </div>

                                <Switch
                                    checked={
                                        current?.enabled ||
                                        false
                                    }
                                    onCheckedChange={(
                                        checked
                                    ) =>
                                        toggleProvider(
                                            provider,
                                            checked
                                        )
                                    }
                                />

                            </div>
                        );
                    })}

                </CardContent>

            </Card>

            {/* DOMAINS */}

            <Card className="border-0 shadow-sm">

                <CardHeader>

                    <CardTitle className="text-2xl">
                        Authorized Domains
                    </CardTitle>

                    <CardDescription className="text-base mt-2">
                        Only these domains can use your AuthKIT project.
                    </CardDescription>

                </CardHeader>

                <CardContent className="space-y-6">

                    <div className="flex gap-3">

                        <Input
                            value={domainInput}
                            onChange={(e) =>
                                setDomainInput(
                                    e.target.value
                                )
                            }
                            placeholder="myapp.com"
                            className="h-12"
                        />

                        <Button
                            onClick={addDomain}
                            className="h-12 gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add
                        </Button>

                    </div>

                    <div className="space-y-3">

                        {domains.map((domain) => (

                            <div
                                key={domain.id}
                                className="flex items-center justify-between rounded-2xl border bg-muted/20 p-4"
                            >

                                <div className="flex items-center gap-3 overflow-hidden">

                                    <div className="w-11 h-11 rounded-xl border bg-background flex items-center justify-center">
                                        <Globe className="h-5 w-5 text-primary" />
                                    </div>

                                    <div>

                                        <p className="font-medium truncate">
                                            {domain.domain}
                                        </p>

                                        <p className="text-sm text-muted-foreground">
                                            Authorized origin
                                        </p>

                                    </div>

                                </div>

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                        removeDomain(
                                            domain.id
                                        )
                                    }
                                >
                                    Remove
                                </Button>

                            </div>

                        ))}

                    </div>

                </CardContent>

            </Card>

            {/* KEYS */}

            <Card className="border-0 shadow-sm">

                <CardHeader>

                    <CardTitle className="text-2xl flex items-center gap-3">
                        <KeyRound className="h-6 w-6" />
                        API Keys
                    </CardTitle>

                    <CardDescription className="text-base mt-2">
                        Full API keys used for SDK integrations.
                    </CardDescription>

                </CardHeader>

                <CardContent className="space-y-6">

                    <div className="space-y-3">

                        <Label>
                            Publishable Key
                        </Label>

                        <div className="flex items-center gap-3 rounded-2xl border bg-muted/20 px-5 py-4">

                            <div className="flex-1 overflow-hidden">

                                <p className="font-mono text-sm break-all">
                                    {project.publishableKey}
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

                    <div className="space-y-3">

                        <Label>
                            Secret Key
                        </Label>

                        <div className="flex items-center gap-3 rounded-2xl border bg-muted/20 px-5 py-4">

                            <div className="flex-1 overflow-hidden">

                                <p className="font-mono text-sm break-all">
                                    {project.secretKey}
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

                    <Separator />

                </CardContent>

            </Card>

            {/* DANGER ZONE */}

            <Card className="border-red-200 shadow-sm">

                <CardHeader>

                    <CardTitle className="text-2xl text-red-600">
                        Danger Zone
                    </CardTitle>

                    <CardDescription className="text-base mt-2">
                        Permanently delete this project and all associated users and sessions.
                    </CardDescription>

                </CardHeader>

                <CardContent>

                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div>

                            <p className="font-semibold text-red-700 text-lg">
                                Delete Project
                            </p>

                            <p className="text-red-600 text-sm mt-2 max-w-2xl leading-relaxed">
                                This action is irreversible.
                            </p>

                        </div>

                        <Button
                            variant="destructive"
                            className="gap-2"
                            onClick={deleteProject}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Project
                        </Button>

                    </div>

                </CardContent>

            </Card>

        </div>
    );
}