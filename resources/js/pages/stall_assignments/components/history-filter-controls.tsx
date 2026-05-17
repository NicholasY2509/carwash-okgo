import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { id as indonesiaLocale } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface HistoryFilterControlsProps {
    filters: { search?: string; date_from?: string; date_to?: string };
    onFilterChange: (key: 'search' | 'date_from' | 'date_to', value: string | Date | undefined) => void;
}

export default function HistoryFilterControls({ filters, onFilterChange }: HistoryFilterControlsProps) {
    const { search = '', date_from, date_to } = filters;

    const selectedDateRange: DateRange | undefined = {
        from: date_from ? new Date(date_from) : undefined,
        to: date_to ? new Date(date_to) : undefined,
    };

    const handleDateRangeSelect = (range: DateRange | undefined) => {
        onFilterChange('date_from', range?.from);
        onFilterChange('date_to', range?.to);
    };

    return (
        <div className="mt-4 flex flex-wrap items-end gap-2">
            <div className="min-w-[150px] flex-grow">
                <label htmlFor="search" className="text-muted-foreground mb-1 block text-sm font-medium">
                    Cari Nama
                </label>
                <Input id="search" placeholder="Nama staff..." value={search} onChange={(e) => onFilterChange('search', e.target.value)} />
            </div>
            <div>
                <label className="text-muted-foreground mb-1 block text-sm font-medium">Rentang Tanggal</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button id="date" variant="outline" className="w-[260px] justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date_from ? (
                                date_to ? (
                                    <>
                                        {format(date_from, 'dd LLL, y', { locale: indonesiaLocale })} -{' '}
                                        {format(date_to, 'dd LLL, y', { locale: indonesiaLocale })}
                                    </>
                                ) : (
                                    format(date_from, 'dd LLL, y', { locale: indonesiaLocale })
                                )
                            ) : (
                                <span>Pilih rentang tanggal</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={selectedDateRange?.from}
                            selected={selectedDateRange}
                            onSelect={handleDateRangeSelect}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
