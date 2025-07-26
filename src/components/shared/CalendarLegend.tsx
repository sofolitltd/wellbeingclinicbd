
'use client'

import { Separator } from "@/components/ui/separator"

export function CalendarLegend() {
    return (
        <>
            <Separator className="my-2" />
            <div className="flex justify-around items-center p-2 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white border border-gray-300"></div>
                    <span>উপলব্ধ</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-600 border border-green-700"></div>
                    <span>নির্বাচিত</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-100 border border-red-300"></div>
                    <span>সব স্লট বুক</span>
                </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted border border-muted-foreground/50"></div>
                    <span>অতীত</span>
                </div>
            </div>
        </>
    )
}
