import { FaUserFriends, FaImage, FaFileAlt, FaUserMd, FaTrashRestore, FaGraduationCap } from "react-icons/fa";

export const sidebarItems = [
    {
        title: 'Pacientes',
        path: '/dashboard',
        icon: FaUserFriends,
        subItems: [
            {
                title: 'Pacientes Eliminados',
                path: '/pacientes/eliminados',
                icon: FaTrashRestore
            }
        ]
    },
    {
        title: 'Publicaciones',
        path: '/publicaciones',
        icon: FaImage
    },
    {
        title: 'Plantillas',
        path: '/test',
        icon: FaFileAlt
    },
    {
        title: 'Psicologos',
        path: '/psicologos',
        icon: FaUserMd,
        subItems: [
            {
                title: 'Psicólogos Eliminados',
                path: '/psicologos/eliminados',
                icon: FaTrashRestore
            },
            {
                title: 'Especializaciones',
                path: '/especializaciones',
                icon: FaGraduationCap
            }
        ]
    }
];
