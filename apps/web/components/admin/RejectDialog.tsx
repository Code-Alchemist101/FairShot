'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface RejectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    companyName: string;
    onConfirm: (reason: string) => void;
    loading?: boolean;
}

export function RejectDialog({
    open,
    onOpenChange,
    companyName,
    onConfirm,
    loading = false,
}: RejectDialogProps) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (reason.length < 10) {
            setError('Rejection reason must be at least 10 characters');
            return;
        }
        onConfirm(reason);
        setReason('');
        setError('');
    };

    const handleCancel = () => {
        setReason('');
        setError('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Reject Company Verification</DialogTitle>
                    <DialogDescription>
                        You are about to reject <span className="font-semibold">{companyName}</span>.
                        Please provide a reason for rejection.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">Rejection Reason</Label>
                        <Textarea
                            id="reason"
                            placeholder="e.g., Invalid business registration documents, incomplete information..."
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                setError('');
                            }}
                            rows={4}
                            className={error ? 'border-red-500' : ''}
                        />
                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                            Minimum 10 characters required
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={loading || reason.length < 10}
                    >
                        {loading ? 'Rejecting...' : 'Reject Company'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
