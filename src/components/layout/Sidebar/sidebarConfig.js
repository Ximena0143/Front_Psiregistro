import { FaUserFriends, FaFileAlt, FaImage, FaClipboard, FaUserMd } from "react-icons/fa";

export const sidebarItems = [
    {
        title: 'Pacientes',
        path: '/dashboard',
        icon: FaUserFriends
    },
    {
        title: 'Documentos',
        path: '/documentos',
        icon: FaFileAlt
    },
    {
        title: 'Publicaciones',
        path: '/publicaciones',
        icon: FaImage
    },
    {
        title: 'Test',
        path: '/test',
        icon: FaClipboard
    },
    {
        title: 'Psicologos',
        path: '/psicologos',
        icon: FaUserMd
    }
];
