import axios from "axios";
import { getApi } from "./api";
import { FILES_API } from "@/components/api-url";
import toast from "react-hot-toast";

export const handleDownload = async (file_name: string) => {
    try {
        const response = await getApi(FILES_API.GET_FILE(file_name));
        const fileUrl = response?.data?.url;

        const fileResponse = await axios.get(fileUrl, {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(fileResponse.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = file_name || 'download';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error downloading document:', error);
        toast.error('Tải xuống tài liệu thất bại');
    }
};