import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Reminder {
    type: string;
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
}

interface ReminderAlertProps {
    reminders: Reminder[];
}

export default function ReminderAlert({ reminders }: ReminderAlertProps) {
    const [dismissedReminders, setDismissedReminders] = useState<string[]>([]);

    const visibleReminders = reminders.filter(
        reminder => !dismissedReminders.includes(`${reminder.type}-${reminder.title}`)
    );

    if (visibleReminders.length === 0) {
        return null;
    }

    const dismissReminder = (reminder: Reminder) => {
        setDismissedReminders(prev => [...prev, `${reminder.type}-${reminder.title}`]);
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high':
                return <AlertTriangle className="h-4 w-4" />;
            case 'medium':
                return <Clock className="h-4 w-4" />;
            default:
                return <AlertTriangle className="h-4 w-4" />;
        }
    };

    const getPriorityVariant = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'destructive';
            case 'medium':
            default:
                return 'default';
        }
    };

    return (
        <div className="space-y-3 w-full flex flex-col">
            {visibleReminders.map((reminder, index) => (
                <Alert
                    key={index}
                    variant={getPriorityVariant(reminder.priority)}
                    className="w-full !block"
                >
                    <div className="flex items-start justify-between w-full">
                        <div className="flex items-start gap-3 w-full">
                            {getPriorityIcon(reminder.priority)}
                            <div className="flex-1">
                                <AlertTitle className="text-sm font-semibold w-full">
                                    {reminder.title}
                                </AlertTitle>
                                <AlertDescription className="text-sm mt-1 whitespace-normal w-full">
                                    {reminder.message}
                                </AlertDescription>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissReminder(reminder)}
                            className="h-6 w-6 p-0 hover:bg-background/50"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                </Alert>
            ))}
        </div>
    );
} 