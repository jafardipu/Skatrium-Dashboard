"use client"
import EventCard from '@/components/cards/EventCard'
import EmptyData from '@/components/shared/EmptyData'
import PaginationSection from '@/components/shared/PaginationSection'
import { cn } from '@/lib/utils'
import { useDeleteEventMutation, useGetAllEventDataQuery } from '@/redux/api/eventApi'
import { Event } from '@/types'
import { Spin } from 'antd'
import { useSearchParams } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { getActualError } from '@/utils/handleError'


export default function EventsContainer() {
    const [deletingEventId, setDeletingEventId] = useState<string | null>(null)
    const page = useSearchParams().get("page") || "1";
    const limit = useSearchParams().get("limit") || "18";

    const queries: Record<string, string> = {};
    if (page) queries["page"] = page;
    if (limit) queries["limit"] = limit;
    queries["isDeleted"] = "false";
    const { data, isLoading } = useGetAllEventDataQuery(queries);
    const [deleteEvent] = useDeleteEventMutation();

    const handleDelete = async (id: string) => {
        setDeletingEventId(id);
        try {
            await deleteEvent(id).unwrap();
            toast.success("Event deleted successfully");
        } catch (error) {
            toast.error(getActualError(error) || "Failed to delete event");
        } finally {
            setDeletingEventId(null);
        }
    };

    if (isLoading) {
        return <div className={cn('h-[calc(100vh-200px)] flex items-center justify-center')}><Spin size='large' /></div>
    }

    if (!data?.data?.data?.length) {
        return <EmptyData message='No event found' />
    }

    return (
        <div className='xl:col-span-2 border border-[#FFFFFF33]/[0.2]  rounded-2xl p-4'>
            <div className='flex items-center gap-x-2 mb-3'>
                <h4 className='text-xl text-[#cad1d6] font-semibold'>Event List</h4>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-5'>
                {
                    data?.data?.data?.map((event: Event, index: number) => (
                        <EventCard
                            key={event._id || index}
                            event={event}
                            onDelete={handleDelete}
                            isDeleting={deletingEventId === event._id}
                        />
                    ))
                }
            </div>
            <PaginationSection total={data?.data?.meta?.total} current={Number(page)} pageSize={Number(limit)} />
        </div>
    )
}
