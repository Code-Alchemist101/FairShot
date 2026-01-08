'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, ExternalLink, Info } from 'lucide-react';
import { format } from 'date-fns';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface Company {
    id: string;
    name: string;
    website: string | null;
    verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
    rejectionReason: string | null;
    createdAt: string;
    user: {
        email: string;
    };
}

interface CompanyTableProps {
    companies: Company[];
    onApprove: (id: string, name: string) => void;
    onReject: (id: string, name: string) => void;
    loading?: boolean;
}

export function CompanyTable({ companies, onApprove, onReject, loading = false }: CompanyTableProps) {
    const getStatusBadge = (status: Company['verificationStatus']) => {
        const variants = {
            PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            VERIFIED: 'bg-green-500/10 text-green-500 border-green-500/20',
            REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
        };

        return (
            <Badge variant="outline" className={variants[status]}>
                {status}
            </Badge>
        );
    };

    if (companies.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No companies found</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Website</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {companies.map((company) => (
                        <TableRow key={company.id}>
                            <TableCell className="font-medium">{company.name}</TableCell>
                            <TableCell className="text-muted-foreground">
                                {company.user.email}
                            </TableCell>
                            <TableCell>
                                {company.website ? (
                                    <a
                                        href={company.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-cyan-500 hover:text-cyan-600 transition-colors"
                                    >
                                        <span className="truncate max-w-[200px]">
                                            {company.website}
                                        </span>
                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                    </a>
                                ) : (
                                    <span className="text-muted-foreground">—</span>
                                )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {format(new Date(company.createdAt), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                                {company.verificationStatus === 'REJECTED' && company.rejectionReason ? (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="inline-flex items-center gap-2">
                                                    {getStatusBadge(company.verificationStatus)}
                                                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs">
                                                <p className="font-semibold mb-1">Rejection Reason:</p>
                                                <p className="text-sm">{company.rejectionReason}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ) : (
                                    getStatusBadge(company.verificationStatus)
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                {company.verificationStatus === 'PENDING' && (
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                                            onClick={() => onApprove(company.id, company.name)}
                                            disabled={loading}
                                        >
                                            <Check className="w-4 h-4 mr-1" />
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                                            onClick={() => onReject(company.id, company.name)}
                                            disabled={loading}
                                        >
                                            <X className="w-4 h-4 mr-1" />
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
