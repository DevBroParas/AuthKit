import Link from "next/link";

import {
    Badge,
} from "@/components/ui/badge";

import {
    Button,
} from "@/components/ui/button";

import {
    Card,
    CardContent,
} from "@/components/ui/card";

import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty";

export default function DocsPage() {
    return (
        <div className="flex min-h-[70vh] items-center justify-center pb-10">
            <Card className="w-full max-w-2xl border-0 shadow-sm">
                <CardContent className="p-10">
                    <Empty>
                        <EmptyHeader>
                            <Badge variant="secondary">
                                Coming soon
                            </Badge>

                            <EmptyTitle className="text-2xl">
                                Docs are not available right now
                            </EmptyTitle>

                            <EmptyDescription className="text-sm">
                                We are putting the finishing touches on them, and they will be here shortly.
                            </EmptyDescription>
                        </EmptyHeader>

                        <EmptyContent>
                            <Button asChild>
                                <Link href="/dashboard">
                                    Back to dashboard
                                </Link>
                            </Button>
                        </EmptyContent>
                    </Empty>
                </CardContent>
            </Card>
        </div>
    );
}
