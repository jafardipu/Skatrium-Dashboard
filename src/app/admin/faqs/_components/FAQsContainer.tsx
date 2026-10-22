"use client";

import { useEffect, useState, type DragEvent } from "react";
import { Button, Popconfirm, Skeleton, Empty, Collapse, message } from "antd";
import { Plus, Trash2, HelpCircle, ChevronDown, GripVertical, SquarePen } from "lucide-react";
import {
  useGetFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  useReorderFaqsMutation,
  type Faq,
} from "@/redux/api/faqsApi"; // adjust import path to match your project
import FaqFormModal, { type FaqFormValues } from "./FaqFormModal";

export default function FAQsContainer() {
  const { data: faqsResponse, isLoading } = useGetFaqsQuery();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [draggedFaqId, setDraggedFaqId] = useState<string | null>(null);
  const [dropTargetFaqId, setDropTargetFaqId] = useState<string | null>(null);

  const [createFaq, { isLoading: isCreating }] = useCreateFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
  const [deleteFaq, { isLoading: isDeleting }] = useDeleteFaqMutation();
  const [reorderFaqs, { isLoading: isReordering }] = useReorderFaqsMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeFaq, setActiveFaq] = useState<Faq | null>(null);

  useEffect(() => {
    const orderedFaqs = [...(faqsResponse?.data ?? [])].sort(
      (first, second) =>
        (first.order ?? Number.MAX_SAFE_INTEGER) -
        (second.order ?? Number.MAX_SAFE_INTEGER),
    );
    setFaqs(orderedFaqs);
  }, [faqsResponse]);

  const openCreateModal = () => {
    setModalMode("create");
    setActiveFaq(null);
    setModalOpen(true);
  };

  const openEditModal = (faq: Faq) => {
    setModalMode("edit");
    setActiveFaq(faq);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (values: FaqFormValues) => {
    try {
      if (modalMode === "create") {
        await createFaq(values).unwrap();
        message.success("FAQ added");
      } else if (activeFaq) {
        await updateFaq({ id: activeFaq?._id, ...values }).unwrap();
        message.success("FAQ updated");
      }
      setModalOpen(false);
    } catch {
      message.error("Something went wrong. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFaq(id).unwrap();
      message.success("FAQ deleted");
    } catch {
      message.error("Failed to delete FAQ");
    }
  };

  const handleFaqDrop = async (event: DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault();
    const draggedId = event.dataTransfer.getData("text/plain") || draggedFaqId;
    setDraggedFaqId(null);
    setDropTargetFaqId(null);

    if (!draggedId || draggedId === targetId || isReordering) return;

    const sourceIndex = faqs.findIndex((faq) => faq._id === draggedId);
    const targetIndex = faqs.findIndex((faq) => faq._id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const previousFaqs = faqs;
    const reordered = [...faqs];
    const [movedFaq] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, movedFaq);
    setFaqs(reordered);

    try {
      await reorderFaqs({
        orders: reordered.map((faq, index) => ({
          id: faq._id,
          order: index + 1,
        })),
      }).unwrap();
      message.success("FAQ order updated");
    } catch {
      setFaqs(previousFaqs);
      message.error("Failed to reorder FAQs");
    }
  };

  return (
    <div className="rounded-xl   shadow-sm text-white">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold ">Frequently Asked Questions</h2>
        </div>
        <Button
          type="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={openCreateModal}
          disabled={isReordering}
          className="flex items-center"
        >
          Add FAQ
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} active paragraph={{ rows: 2 }} />
          ))}
        </div>
      ) : !faqs || faqs.length === 0 ? (
        <Empty description="No FAQs yet. Add your first one." />
      ) : (
        <Collapse
          style={{ color: "white" }}
          // The first FAQ is expanded by default; the rest stay collapsed.
          defaultActiveKey={[faqs[0]?._id]}
          expandIconPosition="end"
          expandIcon={({ isActive }) => (
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform ${
                isActive ? "rotate-180" : ""
              }`}
            />
          )}
          items={faqs.map((faq) => ({
            key: faq?._id,
            label: (
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setDropTargetFaqId(faq._id);
                }}
                onDrop={(event) => handleFaqDrop(event, faq._id)}
                className={`flex items-center gap-2 rounded ${
                  dropTargetFaqId === faq._id ? "ring-2 ring-blue-400" : ""
                }`}
              >
                <button
                  type="button"
                  draggable={!isReordering}
                  disabled={isReordering}
                  onClick={(event) => event.stopPropagation()}
                  onDragStart={(event) => {
                    event.stopPropagation();
                    event.dataTransfer.setData("text/plain", faq._id);
                    event.dataTransfer.effectAllowed = "move";
                    setDraggedFaqId(faq._id);
                  }}
                  onDragEnd={() => {
                    setDraggedFaqId(null);
                    setDropTargetFaqId(null);
                  }}
                  className="cursor-grab touch-none text-gray-400 active:cursor-grabbing disabled:cursor-not-allowed"
                  aria-label={`Reorder FAQ: ${faq.question}`}
                  title="Drag to reorder"
                >
                  <GripVertical className="h-4 w-4" />
                </button>
                <span className="font-medium text-white">{faq.question}</span>
              </div>
            ),
            children: (
              <p className="text-sm leading-relaxed text-gray-800">
                {faq.answer}
              </p>
            ),
            extra: (
              // Stop propagation so clicking these buttons doesn't
              // also toggle the panel open/closed.
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1"
              >
                <button
                  type="button"
                  onClick={() => openEditModal(faq)}
                  disabled={isReordering}
                  className="rounded-md p-2 bg-gray-100 text-blue-600 hover:bg-gray-300 hover:text-blue-900"
                  aria-label="Edit FAQ"
                >
                  <SquarePen className="h-4 w-4" />
                </button>
                <Popconfirm
                  title="Delete this FAQ?"
                  description="This action can't be undone."
                  okText="Delete"
                  okButtonProps={{ danger: true, loading: isDeleting, disabled: isReordering }}
                  onConfirm={() => handleDelete(faq?._id)}
                >
                  <button
                    type="button"
                    disabled={isReordering}
                    className="rounded-md p-2 bg-red-500 text-white  hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete FAQ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Popconfirm>
              </div>
            ),
          }))}
        />
      )}

      <FaqFormModal
        open={modalOpen}
        mode={modalMode}
        initialData={activeFaq}
        loading={isCreating || isUpdating}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
