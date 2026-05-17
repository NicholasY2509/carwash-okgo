import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { router } from "@inertiajs/react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Modal, ModalHeader } from "@/components/ui/modal";
import AssignStaffForm from "../forms/assign-staff-form";
import ActiveStaffList from "./active-staff-list";
import { toast } from "sonner";
import AssignmentCardHeader from "./assignment-card-header";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Stall {
    id: number;
    name: string;
    active_staffs: Staff[];
    active_teams: Staff[];
}

interface Staff {
    id: string;
    full_name: string;
    pivot: {
        id: number;
        start_time: string;
        end_time: string | null;
        is_active: boolean;
        position: string;
    };
}

interface AssignmentCardProps {
    stall: Stall;
    staffs: Staff[];
}

export default function AssignmentCard({ stall, staffs }: AssignmentCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState<number | null>(
        null,
    );

    const initiateDelete = (assignmentId: number) => {
        setAssignmentToDelete(assignmentId);
        setIsAlertOpen(true);
    };

    const executeDelete = () => {
        if (assignmentToDelete === null) return;

        router.delete(`/stall-assignments/${assignmentToDelete}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast("Tugas staff berhasil dihapus.");
            },
            onError: (errors) => {
                toast("Gagal menghapus tugas. Silakan coba lagi.");
                console.error("Error deleting assignment:", errors);
            },
            onFinish: () => {
                setAssignmentToDelete(null);
            },
        });
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>{stall.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <AssignmentCardHeader staffs={staffs} stall={stall} />

                    <Separator className="my-4" />

                    <div className="flex flex-row justify-between items-center">
                        <Label className="font-semibold">Staff Bertugas</Label>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            variant="default"
                            size={"sm"}
                        >
                            Tambah
                        </Button>
                    </div>

                    <ActiveStaffList
                        activeStaffs={stall.active_teams}
                        onDelete={initiateDelete}
                    />
                </CardContent>
            </Card>

            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ModalHeader title={`Tambah Staff untuk ${stall.name}`} />
                <AssignStaffForm
                    onCancel={() => setIsModalOpen(false)}
                    onSuccess={() => setIsModalOpen(false)}
                    staffs={staffs}
                    stall={stall}
                />
            </Modal>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Anda Yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hapus penugasan ini?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setAssignmentToDelete(null)}
                        >
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeDelete}
                            className="bg-destructive  hover:bg-destructive/90"
                        >
                            Ya, Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
