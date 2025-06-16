import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Document } from '@/types/document';
import { FILES_API } from './api-url';
import { getApi } from '@/utils/api';
import { toast } from 'react-hot-toast';

interface ViewDocumentDialogProps {
    document: Document;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const getFileType = (fileName: string) => {
    if (!fileName) return '';
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (!ext) return '';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
    if (['pdf'].includes(ext)) return 'pdf';
    return 'other';
};

const ViewDocumentDialog: React.FC<ViewDocumentDialogProps> = ({ document, open, onOpenChange }) => {
    const [fileUrl, setFileUrl] = useState<string>('');
    const fetchFile = async () => {
        try {
            const response = await getApi(FILES_API.GET_FILE(document.file_name));
            setFileUrl(response.data.url);
        } catch (error) {
            console.error('Error fetching file:', error);
            toast.error('Lỗi khi tải tài liệu');
        }
    }

    useEffect(() => {
        fetchFile();
    }, [open]);

    const fileType = getFileType(document.file_name || fileUrl);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl h-[80vh]">
                <DialogHeader>
                    <DialogTitle>{document.title}</DialogTitle>
                    <DialogDescription>{document.description}</DialogDescription>
                </DialogHeader>
                <div className="w-full h-full flex items-center justify-center">
                    {fileType === 'image' && (
                        <img src={fileUrl} alt={document.title} className="max-h-[60vh] max-w-full rounded shadow" />
                    )}
                    {fileType === 'video' && (
                        <video src={fileUrl} controls className="max-h-[60vh] max-w-full rounded shadow" />
                    )}
                    {fileType === 'pdf' && (
                        <iframe
                            src={fileUrl}
                            title={document.title}
                            className="w-full h-[60vh] border rounded"
                        />
                    )}
                    {fileType === 'other' && (
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            Tải về hoặc mở file
                        </a>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewDocumentDialog;