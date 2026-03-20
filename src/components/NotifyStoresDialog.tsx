//src/components/NotifyStoresDialog.tsx
'use client';

import { useState, ChangeEvent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';

// A simple Textarea component with basic styling.
const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-50"
  />
);

// A new, reusable component for a form field with a label and input.
const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid gap-2">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    {children}
  </div>
);

interface NotifyStoresDialogProps {
  onNotify: (title: string, body: string, imageUrl?: string) => void;
  selectedCount: number;
}

export default function NotifyStoresDialog({ onNotify, selectedCount }: NotifyStoresDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !body) {
      toast.error('Title and message are required.');
      return;
    }
    setLoading(true);
    try {
      await onNotify(title, body, imageUrl);
      setTitle('');
      setBody('');
      setImageUrl('');
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to send notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <Button
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          disabled={selectedCount === 0}
        >
          <Bell className="w-5 h-5" />
          <span className="hidden sm:inline">Notify ({selectedCount})</span>
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-xl translate-x-[-50%] translate-y-[-50%] gap-6 border border-gray-200 bg-white p-8 shadow-2xl rounded-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg">
          <Dialog.Title className="text-2xl font-bold text-orange-600">
            Send Bulk Notification
          </Dialog.Title>
          <Dialog.Description className="text-base text-gray-500">
            Enter the details for the notification you want to send to **{selectedCount}** stores.
          </Dialog.Description>
          <div className="grid gap-6">
            <FormField label="Title">
              <Input
                id="title"
                value={title}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                placeholder="e.g., Exciting new offer!"
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              />
            </FormField>

            <FormField label="Message">
              <Textarea
                id="body"
                value={body}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
                placeholder="e.g., Check out our amazing new products and discounts!"
              />
            </FormField>

            <FormField label="Image URL (Optional)">
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)}
                placeholder="e.g., https://example.com/image.png"
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              />
            </FormField>

            {imageUrl && (
              <div className="mt-2 p-4 border border-dashed border-gray-300 rounded-md bg-gray-50">
                <p className="text-sm text-gray-500 mb-2">Image Preview</p>
                <img
                  src={imageUrl}
                  alt="Notification preview"
                  className="w-full h-auto max-h-48 object-cover rounded-md"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="ghost" className="text-gray-600 hover:bg-gray-100">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
              {loading ? 'Sending...' : `Send to ${selectedCount} stores`}
            </Button>
          </div>
          <Dialog.Close asChild>
            <button className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-5 w-5"><path d="M18 6L6 18M6 6L18 18"></path></svg>
              <span className="sr-only">Close</span>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}